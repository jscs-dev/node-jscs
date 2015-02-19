var treeIterator = require('./tree-iterator');

/**
 * Operator list which are represented as keywords in token list.
 */
var KEYWORD_OPERATORS = {
    'instanceof': true,
    'in': true
};

/**
 * File representation for JSCS.
 *
 * @name JsFile
 */
var JsFile = function(filename, source, tree, options) {
    options = options || {};

    this._filename = filename;
    this._source = source;
    this._tree = tree || {tokens: [], comments: []};

    this._es3 = options.es3 || false;
    this._es6 = options.es6 || false;

    this._lineBreaks = null;
    this._lines = source.split(/\r\n|\r|\n/);

    this._tree.tokens = this._fixEs6Tokens(this._tree.tokens);
    this._tokens = this._buildTokenList(this._tree.tokens, this._tree.comments);
    this._addEOFToken();
    this._applyWhitespaceData(this._tokens, source);

    var tokenIndexes = this._buildTokenIndex(this._tokens);
    this._tokenRangeStartIndex = tokenIndexes.tokenRangeStartIndex;
    this._tokenRangeEndIndex = tokenIndexes.tokenRangeEndIndex;
    this._tokensByLineIndex = tokenIndexes.tokensByLineIndex;

    this._index = this._buildNodeIndex();
    this._fixEsprimaIdentifiers();

    this._buildDisabledRuleIndex();
};

JsFile.prototype = {
    /**
     * Returns the first line break character encountered in the file.
     * Assumes LF if the file is only one line.
     *
     * @returns {String}
     */
    getLineBreakStyle: function() {
        var lineBreaks = this.getLineBreaks();
        return lineBreaks.length ? lineBreaks[0] : '\n';
    },

    /**
     * Returns all line break characters from the file.
     *
     * @returns {String[]}
     */
    getLineBreaks: function() {
        if (this._lineBreaks === null) {
            this._lineBreaks = this._source.match(/\r\n|\r|\n/g) || [];
        }
        return this._lineBreaks;
    },

    /**
     * Builds an index of disabled rules by starting line for error suppression.
     *
     * @private
     */
    _buildDisabledRuleIndex: function() {
        this._disabledRuleIndex = [];

        var comments = this.getComments();
        var commentRe = /(jscs\s*:\s*(en|dis)able)(.*)/;

        comments.forEach(function(comment) {
            var enabled;
            var parsed = commentRe.exec(comment.value.trim());

            if (!parsed || parsed.index !== 0) {
                return;
            }

            enabled = parsed[2] === 'en';
            this._addToDisabledRuleIndex(enabled, parsed[3], comment.loc.start.line);
        }, this);
    },

    /**
     * Returns whether a specific rule is disabled on the given line.
     *
     * @param {String} ruleName the rule name being tested
     * @param {Number} line the line number being tested
     * @returns {Boolean} true if the rule is enabled
     */
    isEnabledRule: function(ruleName, line) {
        var enabled = true;
        this._disabledRuleIndex.some(function(region) {
            // once the comment we're inspecting occurs after the location of the error,
            // no longer check for whether the state is enabled or disable
            if (region.line > line) {
                return true;
            }

            if (region.rule === ruleName || region.rule === '*') {
                enabled = region.enabled;
            }
        }, this);

        return enabled;
    },

    /**
     * Adds rules to the disabled index given a string containing rules (or '' for all).
     *
     * @param {Boolean} enabled whether the rule is disabled or enabled on this line
     * @param {String} rulesStr the string containing specific rules to en/disable
     * @param {Number} line the line the comment appears on
     * @private
     */
    _addToDisabledRuleIndex: function(enabled, rulesStr, line) {
        rulesStr = rulesStr || '*';

        rulesStr.split(',').forEach(function(rule) {
            rule = rule.trim();

            if (!rule) {
                return;
            }

            this._disabledRuleIndex.push({
                rule: rule,
                enabled: enabled,
                line: line
            });
        }, this);
    },

    /**
     * Builds token index by starting pos for futher navigation.
     *
     * @param {Object[]} tokens
     * @returns {{tokenRangeStartIndex: {}, tokenRangeEndIndex: {}}}
     * @private
     */
    _buildTokenIndex: function(tokens) {
        var tokenRangeStartIndex = {};
        var tokenRangeEndIndex = {};
        var tokensByLineIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            var token = tokens[i];

            // tokens by range
            tokenRangeStartIndex[token.range[0]] = i;
            tokenRangeEndIndex[token.range[1]] = i;

            // tokens by line
            var lineNumber = token.loc.start.line;
            if (!tokensByLineIndex[lineNumber]) {
                tokensByLineIndex[lineNumber] = [];
            }
            tokensByLineIndex[lineNumber].push(token);

            token._tokenIndex = i;
        }
        return {
            tokenRangeStartIndex: tokenRangeStartIndex,
            tokenRangeEndIndex: tokenRangeEndIndex,
            tokensByLineIndex: tokensByLineIndex
        };
    },

    /**
     * Returns token using range start from the index.
     *
     * @returns {Object|undefined}
     */
    getTokenByRangeStart: function(start) {
        var tokenIndex = this._tokenRangeStartIndex[start];
        return tokenIndex === undefined ? undefined : this._tokens[tokenIndex];
    },

    /**
     * Returns token using range end from the index.
     *
     * @returns {Object|undefined}
     */
    getTokenByRangeEnd: function(end) {
        var tokenIndex = this._tokenRangeEndIndex[end];
        return tokenIndex === undefined ? undefined : this._tokens[tokenIndex];
    },

    /**
     * Returns the first token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getFirstNodeToken: function(node) {
        return this.getTokenByRangeStart(node.range[0]);
    },

    /**
     * Returns the last token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getLastNodeToken: function(node) {
        return this.getTokenByRangeEnd(node.range[1]);
    },

    /**
     * Returns the first token for the file.
     *
     * @returns {Object}
     */
    getFirstToken: function() {
        return this._tokens[0];
    },

    /**
     * Returns the last token for the file.
     *
     * @returns {Object}
     */
    getLastToken: function() {
        return this._tokens[this._tokens.length - 1];
    },

    /**
     * Returns the first token before the given.
     *
     * @param {Object} token
     * @param {Object} [options]
     * @param {Boolean} [options.includeComments=false]
     * @returns {Object|undefined}
     */
    getPrevToken: function(token, options) {
        var index = token._tokenIndex - 1;
        if (index < 0) {
            return undefined;
        }

        if (options && options.includeComments) {
            return this._tokens[index];
        }

        do {
            if (!this._tokens[index].isComment) {
                return this._tokens[index];
            }
        } while (--index >= 0);

        return undefined;
    },

    /**
     * Returns the first token after the given.
     *
     * @param {Object} token
     * @param {Object} [options]
     * @param {Boolean} [options.includeComments=false]
     * @returns {Object|undefined}
     */
    getNextToken: function(token, options) {
        var index = token._tokenIndex + 1;

        if (index >= this._tokens.length) {
            return undefined;
        }

        if (options && options.includeComments) {
            return this._tokens[index];
        }

        do {
            if (!this._tokens[index].isComment) {
                return this._tokens[index];
            }
        } while (++index < this._tokens.length);
    },

    /**
     * Returns the first token before the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} type
     * @param {String} [value]
     * @returns {Object|undefined}
     */
    findPrevToken: function(token, type, value) {
        var prevToken = this.getPrevToken(token);
        while (prevToken) {
            if (prevToken.type === type && (value === undefined || prevToken.value === value)) {
                return prevToken;
            }
            prevToken = this.getPrevToken(prevToken);
        }
        return prevToken;
    },

    /**
     * Returns the first token after the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} type
     * @param {String} [value]
     * @returns {Object|undefined}
     */
    findNextToken: function(token, type, value) {
        var nextToken = this.getNextToken(token);
        while (nextToken) {
            if (nextToken.type === type && (value === undefined || nextToken.value === value)) {
                return nextToken;
            }
            nextToken = this.getNextToken(nextToken);
        }
        return nextToken;
    },

    /**
     * Returns the first token before the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} value
     * @returns {Object|undefined}
     */
    findPrevOperatorToken: function(token, value) {
        return this.findPrevToken(token, value in KEYWORD_OPERATORS ? 'Keyword' : 'Punctuator', value);
    },

    /**
     * Returns the first token after the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} value
     * @returns {Object|undefined}
     */
    findNextOperatorToken: function(token, value) {
        return this.findNextToken(token, value in KEYWORD_OPERATORS ? 'Keyword' : 'Punctuator', value);
    },

    /**
     * Iterates through the token tree using tree iterator.
     * Calls passed function for every token.
     *
     * @param {Function} cb
     * @param {Object} [tree]
     */
    iterate: function(cb, tree) {
        return treeIterator.iterate(tree || this._tree, cb);
    },

    /**
     * Returns node by its range position
     *
     * @returns {Object}
     */
    getNodeByRange: function(number) {
        var result = {};
        this.iterate(function(node) {
            if (number >= node.range[0] && number < node.range[1]) {
                result = node;
            }
            if (number < node.range[0]) {
                return false;
            }
        });
        return result;
    },

    /**
     * Returns nodes by type(s) from earlier built index.
     *
     * @param {String|String[]} type
     * @returns {Object[]}
     */
    getNodesByType: function(type) {
        if (typeof type === 'string') {
            return this._index[type] || [];
        } else {
            var result = [];
            for (var i = 0, l = type.length; i < l; i++) {
                var nodes = this._index[type[i]];
                if (nodes) {
                    result = result.concat(nodes);
                }
            }
            return result;
        }
    },

    /**
     * Iterates nodes by type(s) from earlier built index.
     * Calls passed function for every matched node.
     *
     * @param {String|String[]} type
     * @param {Function} cb
     */
    iterateNodesByType: function(type, cb) {
        return this.getNodesByType(type).forEach(cb);
    },

    /**
     * Iterates tokens by type(s) from the token array.
     * Calls passed function for every matched token.
     *
     * @param {String|String[]} type
     * @param {Function} cb
     */
    iterateTokensByType: function(type, cb) {
        var types = (typeof type === 'string') ? [type] : type;
        var typeIndex = {};
        types.forEach(function(type) {
            typeIndex[type] = true;
        });

        this.getTokens().forEach(function(token, index, tokens) {
            if (typeIndex[token.type]) {
                cb(token, index, tokens);
            }
        });
    },

    /**
     * Iterates token by value from the token array.
     * Calls passed function for every matched token.
     *
     * @param {String|String[]} name
     * @param {Function} cb
     */
    iterateTokenByValue: function(name, cb) {
        var names = (typeof name === 'string') ? [name] : name;
        var nameIndex = {};
        names.forEach(function(type) {
            nameIndex[type] = true;
        });

        this.getTokens().forEach(function(token, index, tokens) {
            if (nameIndex.hasOwnProperty(token.value)) {
                cb(token, index, tokens);
            }
        });
    },

    /**
     * Iterates tokens by type and value(s) from the token array.
     * Calls passed function for every matched token.
     *
     * @param {String} type
     * @param {String|String[]} value
     * @param {Function} cb
     */
    iterateTokensByTypeAndValue: function(type, value, cb) {
        var values = (typeof value === 'string') ? [value] : value;
        var valueIndex = {};
        values.forEach(function(type) {
            valueIndex[type] = true;
        });

        this.getTokens().forEach(function(token, index, tokens) {
            if (token.type === type && valueIndex[token.value]) {
                cb(token, index, tokens);
            }
        });
    },

    /**
     * Returns first token for the specified line.
     * Line numbers start with 1.
     *
     * @param {Number} lineNumber
     * @param {Object} [options]
     * @param {Boolean} [options.includeComments]
     * @returns {Object|undefined}
     */
    getFirstTokenOnLine: function(lineNumber, options) {
        var tokensByLine = this._tokensByLineIndex[lineNumber];

        if (!tokensByLine) {
            return undefined;
        }

        if (options && options.includeComments) {
            return tokensByLine[0];
        }

        for (var i = 0; i < tokensByLine.length; i++) {
            var token = tokensByLine[i];
            if (!token.isComment) {
                return token;
            }
        }

        return undefined;
    },

    /**
     * Returns which dialect of JS this file supports.
     *
     * @returns {String}
     */
    getDialect: function() {
        if (this._es6) {
            return 'es6';
        }

        if (this._es3) {
            return 'es3';
        }

        return 'es5';
    },

    /**
     * Returns string representing contents of the file.
     *
     * @returns {String}
     */
    getSource: function() {
        return this._source;
    },

    /**
     * Returns token tree, built using esprima.
     *
     * @returns {Object}
     */
    getTree: function() {
        return this._tree;
    },

    /**
     * Returns token list, built using esprima.
     *
     * @returns {Object[]}
     */
    getTokens: function() {
        return this._tokens;
    },

    /**
     * Returns comment token list, built using esprima.
     */
    getComments: function() {
        return this._tree.comments;
    },

    /**
     * Returns source filename for this object representation.
     *
     * @returns {String}
     */
    getFilename: function() {
        return this._filename;
    },

    /**
     * Returns array of source lines for the file.
     *
     * @returns {String[]}
     */
    getLines: function() {
        return this._lines;
    },

    /**
     * Returns array of source lines for the file with comments removed.
     *
     * @returns {Array}
     */
    getLinesWithCommentsRemoved: function() {
        var lines = this.getLines().concat();

        this.getComments().concat().reverse().forEach(function(comment) {
            var startLine = comment.loc.start.line;
            var startCol = comment.loc.start.column;
            var endLine = comment.loc.end.line;
            var endCol = comment.loc.end.column;
            var i = startLine - 1;

            if (startLine === endLine) {
                lines[i] = lines[i].substring(0, startCol) + lines[i].substring(endCol);
            } else {
                lines[i] = lines[i].substring(0, startCol);
                for (var x = i + 1; x < endLine - 1; x++) {
                    lines[x] = '';
                }
                lines[x] = lines[x].substring(endCol);
            }
        });

        return lines;
    },

    /**
     * Renders JS-file sources using token list.
     *
     * @returns {String}
     */
    render: function() {
        var result = '';

        // For-loop for maximal speed.
        for (var i = 0; i < this._tokens.length; i++) {
            var token = this._tokens[i];

            result += token.whitespaceBefore;

            switch (token.type) {
                // Line-comment: // ...
                case 'Line':
                    result += '//' + token.value;
                    break;

                // Block-comment: /* ... */
                case 'Block':
                    result += '/*' + token.value + '*/';
                    break;

                default:
                    result += token.value;
            }
        }
        return result;
    },

    /**
     * Builds token list using both code tokens and comment-tokens.
     *
     * @returns {Object[]}
     * @private
     */
    _buildTokenList: function(codeTokens, commentTokens) {
        var result = [];
        var codeQueue = codeTokens.concat();
        var commentQueue = commentTokens.concat();
        while (codeQueue.length > 0 || commentQueue.length > 0) {
            if (codeQueue.length > 0 && (!commentQueue.length || commentQueue[0].range[0] > codeQueue[0].range[0])) {
                result.push(codeQueue.shift());
            } else {
                var commentToken = commentQueue.shift();
                commentToken.isComment = true;
                result.push(commentToken);
            }
        }
        return result;
    },

    /**
     * Adds JSCS-specific EOF (end of file) token.
     *
     * @private
     */
    _addEOFToken: function() {
        var loc = {
            line: this._lines.length,
            column: this._lines[this._lines.length - 1].length
        };
        this._tokens.push({
            type: 'EOF',
            value: '',
            range: [this._source.length, this._source.length + 1],
            loc: {start: loc, end: loc}
        });
    },

    /**
     * Applies whitespace information to the token list.
     *
     * @param {Object[]} tokens
     * @param {String} source
     * @private
     */
    _applyWhitespaceData: function(tokens, source) {
        var prevPos = 0;
        // For-loop for maximal speed.
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            var rangeStart = token.range[0];
            var whitespace;
            if (rangeStart === prevPos) {
                whitespace = '';
            } else {
                whitespace = source.substring(prevPos, rangeStart);
            }
            token.whitespaceBefore = whitespace;
            prevPos = token.range[1];
        }
    },

    /**
     * Temporary fix (I hope) for esprima tokenizer, which results
     * in duplicate tokens on `export default function() {}`
     * (https://code.google.com/p/esprima/issues/detail?id=631)
     *
     * @param {Object[]} tokens
     * @returns {Object[]}
     * @private
     */
    _fixEs6Tokens: function(tokens) {
        if (this.getDialect() !== 'es6') {
            return tokens;
        }

        var tokenHash = {};
        return tokens.filter(function(token) {
            var hashKey = token.range[0] + '_' + token.range[1];
            var isDuplicate = tokenHash[hashKey];

            tokenHash[hashKey] = true;

            return !isDuplicate;
        });
    },

    /**
     * Builds node index using node type as the key.
     *
     * @returns {Object}
     * @private
     */
    _buildNodeIndex: function() {
        var index = {};
        this.iterate(function(node, parentNode, parentCollection) {
            var type = node.type;

            node.parentNode = parentNode;
            node.parentCollection = parentCollection;
            (index[type] || (index[type] = [])).push(node);
        });
        return index;
    },

    /**
     * Temporary fix (I hope) for esprima tokenizer
     * (https://code.google.com/p/esprima/issues/detail?id=481)
     * Fixes #83, #180
     * @private
     */
    _fixEsprimaIdentifiers: function() {
        var _this = this;

        this.iterateNodesByType(['Property', 'MemberExpression'], function(node) {
            switch (node.type) {
                case 'Property':
                    convertKeywordToIdentifierIfRequired(node.key);
                    break;
                case 'MemberExpression':
                    convertKeywordToIdentifierIfRequired(node.property);
                    break;
            }
        });

        function convertKeywordToIdentifierIfRequired(node) {
            var token = _this.getTokenByRangeStart(node.range[0]);
            if (token.type === 'Keyword') {
                token.type = 'Identifier';
            }
        }
    }
};

/**
 * Parses a JS-file.
 *
 * @param {String} source
 * @param {Object} esprima
 * @param {Object} [esprimaOptions]
 * @returns {Object}
 */
JsFile.parse = function(source, esprima, esprimaOptions) {
    var finalEsprimaOptions = {
        tolerant: true
    };

    if (esprimaOptions) {
        for (var key in esprimaOptions) {
            finalEsprimaOptions[key] = esprimaOptions[key];
        }
    }

    // Set required options
    finalEsprimaOptions.loc = true;
    finalEsprimaOptions.range = true;
    finalEsprimaOptions.comment = true;
    finalEsprimaOptions.tokens = true;
    finalEsprimaOptions.sourceType = 'module';

    var hashbang = source.indexOf('#!') === 0;
    var tree;

    // Convert bin annotation to a comment
    if (hashbang) {
        source = '//' + source.substr(2);
    }

    var instrumentationData = {};
    var hasInstrumentationData = false;
    // Process special case code like iOS instrumentation imports: `#import 'abc.js';`
    source = source.replace(/^#!?[^\n]+\n/gm, function(str, pos) {
        hasInstrumentationData = true;
        instrumentationData[pos] = str.substring(0, str.length - 1);
        return '//' + str.slice(2);
    });

    tree = esprima.parse(source, finalEsprimaOptions);

    // Change the bin annotation comment
    if (hashbang) {
        tree.comments[0].type = 'Hashbang';
        tree.comments[0].value = '#!' + tree.comments[0].value;
    }

    if (hasInstrumentationData) {
        tree.comments.forEach(function(token) {
            var rangeStart = token.range[0];
            if (instrumentationData.hasOwnProperty(rangeStart)) {
                token.type = 'InstrumentationDirective';
                token.value = instrumentationData[rangeStart];
            }
        });
    }

    return tree;
};

module.exports = JsFile;
