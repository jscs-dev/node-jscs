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
    this._tree = tree || {tokens: []};

    this._es3 = options.es3 || false;
    this._es6 = options.es6 || false;

    this._lines = source.split(/\r\n|\r|\n/);
    this._tokenRangeStartIndex = null;
    this._tokenRangeEndIndex = null;
    var index = this._index = {};
    var _this = this;

    this._buildTokenIndex();

    this.iterate(function(node, parentNode, parentCollection) {
        var type = node.type;

        node.parentNode = parentNode;
        node.parentCollection = parentCollection;
        (index[type] || (index[type] = [])).push(node);

        // Temporary fix (i hope) for esprima tokenizer
        // (https://code.google.com/p/esprima/issues/detail?id=481)
        // Fixes #83, #180
        switch (type) {
            case 'Property':
                convertKeywordToIdentifierIfRequired(node.key);
                break;
            case 'MemberExpression':
                convertKeywordToIdentifierIfRequired(node.property);
                break;
        }
    });

    this._buildDisabledRuleIndex();

    // Part of temporary esprima fix.
    function convertKeywordToIdentifierIfRequired(node) {
        var tokenPos = _this.getTokenPosByRangeStart(node.range[0]);
        var token = _this._tree.tokens[tokenPos];
        if (token.type === 'Keyword') {
            token.type = 'Identifier';
        }
    }
};

JsFile.prototype = {
    /**
     * Builds an index of disabled rules by starting line for error suppression.
     */
    _buildDisabledRuleIndex: function() {
        this._disabledRuleIndex = [];

        var comments = this.getComments() || [];
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
     */
    _buildTokenIndex: function() {
        // Temporary fix (i hope) for esprima tokenizer, which results
        // in duplicate tokens on `export default function() {}`
        // (https://code.google.com/p/esprima/issues/detail?id=631)
        if (this.getDialect() === 'es6') {
            var tokenHash = {};
            this._tree.tokens = this._tree.tokens.filter(function(token) {
                var hashKey = token.range[0] + '_' + token.range[1];
                var isDuplicate = tokenHash[hashKey];

                tokenHash[hashKey] = true;

                return !isDuplicate;
            });
        }

        var tokens = this._tree.tokens;
        var tokenRangeStartIndex = {};
        var tokenRangeEndIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenRangeStartIndex[tokens[i].range[0]] = i;
            tokenRangeEndIndex[tokens[i].range[1]] = i;
            tokens[i]._tokenIndex = i;
        }
        this._tokenRangeStartIndex = tokenRangeStartIndex;
        this._tokenRangeEndIndex = tokenRangeEndIndex;
    },
    /**
     * Builds comments index by starting pos for futher navigation.
     */
    _buildCommentIndex: function() {
        var comments = this.getComments();
        var tokens = this.getTokens();
        var tokenIndex = 0;
        var tokensLength = tokens.length;
        var tokenCommentsBeforeIndex = this._tokenCommentsBeforeIndex = {};
        var tokenCommentsAfterIndex = this._tokenCommentsAfterIndex = {};
        var partialComments = [];
        for (var i = 0, l = comments.length; i < l && comments[i].range[1] <= tokens[0].range[0]; i++) {
            partialComments.push(comments[i]);
        }
        if (partialComments.length) {
            tokenCommentsBeforeIndex[0] = partialComments;
            partialComments = [];
        }
        for (; i < l; i++) {
            var startPos = comments[i].range[0];
            if (partialComments.length) {
                tokenCommentsAfterIndex[tokenIndex] = partialComments;
                tokenCommentsBeforeIndex[tokenIndex + 1] = partialComments;
                partialComments = [];
            }
            while (tokenIndex + 1 < tokensLength && tokens[tokenIndex + 1].range[1] <= startPos) {
                tokenIndex++;
            }
            partialComments.push(comments[i]);
        }
        if (partialComments.length) {
            tokenCommentsAfterIndex[tokenIndex] = partialComments;
            tokenCommentsBeforeIndex[tokenIndex + 1] = partialComments;
        }
    },
    /**
     * Returns token position using range start from the index.
     *
     * @returns {Object}
     */
    getTokenPosByRangeStart: function(start) {
        return this._tokenRangeStartIndex[start];
    },
    /**
     * Returns token using range start from the index.
     *
     * @returns {Object|undefined}
     */
    getTokenByRangeStart: function(start) {
        var tokenIndex = this._tokenRangeStartIndex[start];
        return tokenIndex === undefined ? undefined : this._tree.tokens[tokenIndex];
    },
    /**
     * Returns token using range end from the index.
     *
     * @returns {Object|undefined}
     */
    getTokenByRangeEnd: function(end) {
        var tokenIndex = this._tokenRangeEndIndex[end];
        return tokenIndex === undefined ? undefined : this._tree.tokens[tokenIndex];
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
     * Returns the first token before the given.
     *
     * @param {Object} token
     * @returns {Object|undefined}
     */
    getPrevToken: function(token) {
        var index = token._tokenIndex - 1;
        return index >= 0 ? this._tree.tokens[index] : undefined;
    },
    /**
     * Returns the first token after the given.
     *
     * @param {Object} token
     * @returns {Object|undefined}
     */
    getNextToken: function(token) {
        var index = token._tokenIndex + 1;
        return index < this._tree.tokens.length ? this._tree.tokens[index] : undefined;
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
     * Returns comment node directly followed by a token
     *
     * @param {Object} token
     * @returns {Object|undefined}
     */
    getCommentAfterToken: function(token) {
        if (!this._tokenCommentsAfterIndex) {
            this._buildCommentIndex();
        }
        var comments = this._tokenCommentsAfterIndex[token._tokenIndex];
        return comments ? comments[0] : undefined;
    },
    /**
     * Returns comment node directly followed by a token
     *
     * @param {Object} token
     * @returns {Object|undefined}
     */
    getCommentBeforeToken: function(token) {
        if (!this._tokenCommentsBeforeIndex) {
            this._buildCommentIndex();
        }
        var comments = this._tokenCommentsBeforeIndex[token._tokenIndex];
        return comments ? comments[comments.length - 1] : undefined;
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
        return this._tree.tokens;
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
     * Will report erroneous trailing tokens in multiline comments if an error reporter is provided.
     *
     * @param {Errors} [errors=null] errors
     * @returns {Array}
     */
    getLinesWithCommentsRemoved: function(errors) {
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

                if (errors && lines[x] !== '') {
                    errors.add(
                        'Multiline comments should not have tokens on its ending line',
                        x + 1,
                        endCol
                    );
                }
            }
        });

        return lines;
    }
};

module.exports = JsFile;
