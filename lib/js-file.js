var treeIterator = require('./tree-iterator');
var cst = require('cst');
var Parser = cst.Parser;
var Program = cst.types.Program;

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
 * @param {Object} params
 * @param {String} params.filename
 * @param {String} params.source
 * @param {Object} params.esprima
 * @param {Object} [params.esprimaOptions]
 * @param {Boolean} [params.es3]
 * @param {Boolean} [params.es6]
 */
var JsFile = function(params) {
    params = params || {};
    this._parseErrors = [];
    this._filename = params.filename;
    this._source = params.source;

    this._es3 = params.es3 || false;
    this._es6 = params.es6 || false;

    this._lineBreaks = null;
    this._lines = this._source.split(/\r\n|\r|\n/);

    var parser = new Parser();
    parser.disableStrictMode();

    try {
        this._program = parser.parse(this._source);
    } catch (e) {
        this._parseErrors.push(e);
        this._program = new Program([]);
    }

    //this._program.tokens = this._fixEs6Tokens(this._program.tokens);
    //this._tokens = this._buildTokenList(this._program.tokens, this._program.comments);
    //this._addEOFToken();
    //this._applyWhitespaceData(this._tokens, this._source);
    //
    //var tokenIndexes = this._buildTokenIndex(this._tokens);
    //this._tokenRangeStartIndex = tokenIndexes.tokenRangeStartIndex;
    //this._tokenRangeEndIndex = tokenIndexes.tokenRangeEndIndex;
    //this._tokensByLineIndex = tokenIndexes.tokensByLineIndex;
    //
    //var nodeIndexes = this._buildNodeIndex();
    //this._index = nodeIndexes.nodesByType;
    //this._nodesByStartRange = nodeIndexes.nodesByStartRange;
    //
    //this._fixEsprimaIdentifiers();

    this._buildDisabledRuleIndex();
};

JsFile.prototype = {
    /**
     * @returns {cst.types.Program}
     */
    getProgram: function() {
        return this._program;
    },

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
     * @param {Element} element being tested
     * @returns {Boolean} true if the rule is enabled
     */
    isEnabledRule: function(ruleName, element) {
        return true;
        //var enabled = true;
        //this._disabledRuleIndex.some(function(region) {
        //    // once the comment we're inspecting occurs after the location of the error,
        //    // no longer check for whether the state is enabled or disable
        //    if (region.line > line) {
        //        return true;
        //    }
        //
        //    if (region.rule === ruleName || region.rule === '*') {
        //        enabled = region.enabled;
        //    }
        //}, this);
        //
        //return enabled;
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
        return node.firstToken;
    },

    /**
     * Returns the last token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getLastNodeToken: function(node) {
        return node.lastToken;
    },

    /**
     * Returns the first token for the file.
     *
     * @returns {Object}
     */
    getFirstToken: function() {
        return this._program.firstToken;
    },

    /**
     * Returns the last token for the file.
     *
     * @returns {Object}
     */
    getLastToken: function() {
        return this._program.lastToken;
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
        if (options && options.includeComments) {
            return token.previousNonWhitespaceToken;
        } else {
            return token.previousToken;
        }
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
        if (options && options.includeComments) {
            return token.nextNonWhitespaceToken;
        } else {
            return token.nextCodeToken;
        }
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
        return treeIterator.iterate(tree || this._program, cb);
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
     * Returns nodes by range start index from earlier built index.
     *
     * @param {Object} token
     * @returns {Object[]}
     */
    getNodesByFirstToken: function(token) {
        var result = [];
        if (token && token.range && token.range[0] >= 0) {
            var nodes = this._nodesByStartRange[token.range[0]];
            if (nodes) {
                result = result.concat(nodes);
            }
        }
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
            return this._program.selectNodesByType(type);
        } else {
            var result = [];
            for (var i = 0, l = type.length; i < l; i++) {
                var nodes = this._program.selectNodesByType(type[i]);
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
        var tokens;
        if (Array.isArray(type)) {
            tokens = [];
            for (var i = 0; i < type.length; i++) {
                var items = this._program.selectTokensByType(type[i]);
                tokens = tokens.concat(items);
            }
        } else {
            tokens = this._program.selectTokensByType(type);
        }

        tokens.forEach(cb);
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

        this.iterateTokensByType(type, function(token) {
            if (valueIndex[token.value]) {
                cb(token);
            }
        });
    },

    /**
     * Returns first token for the specified line.
     * Line numbers start with 1.
     *
     * @param {Number} lineNumber
     * @param {Object} [options]
     * @param {Boolean} [options.includeComments = false]
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
        return this._program;
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
        var comments = [];
        var token = this._program.firstToken;
        while (token) {
            if (token.isComment) {
                comments[comments.length] = token;
            }
            token = token.nextToken;
        }
        return comments;
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
        return this._program.sourceCode;
    },

    /**
     * Returns list of parse errors.
     *
     * @returns {Error[]}
     */
    getParseErrors: function() {
        return this._parseErrors;
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
function parseJavaScriptSource(source, esprima, esprimaOptions) {
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
}

module.exports = JsFile;
