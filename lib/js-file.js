var treeIterator = require('./tree-iterator');

/**
 * File representation for JSCS.
 *
 * @name JsFile
 */
var JsFile = function(filename, source, tree) {
    this._filename = filename;
    this._source = source;
    this._tree = tree || {tokens: []};
    this._lines = source.split(/\r\n|\r|\n/);
    this._tokenIndex = null;
    var index = this._index = {};
    var _this = this;

    this._buildTokenIndex();

    this.iterate(function(node, parentNode, parentCollection) {
        if (node) {
            var type = node.type;
            if (type) {
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
            }
        }
    });

    this._buildDisabledRuleIndex();

    // Part of temporary esprima fix.
    function convertKeywordToIdentifierIfRequired(node) {
        var tokenPos = _this.getTokenPosByRangeStart(node.range[0]);
        if (tokenPos !== undefined) {
            var token = _this._tree.tokens[tokenPos];
            if (token.type === 'Keyword') {
                token.type = 'Identifier';
            }
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
     * returns whether a specific rule is disabled on the given line.
     *
     * @param {String} rule the rule name being tested
     * @param {Number} line the line number being tested
     * @returns {Boolean} true if the rule is enabled
     */
    isEnabledRule: function(rule, line) {
        var enabled = true;
        this._disabledRuleIndex.some(function(region) {
            // once the comment we're inspecting occurs after the location of the error,
            // no longer check for whether the state is enabled or disable
            if (region.line > line) {
                return true;
            }

            if (region.rule === rule || region.rule === '*') {
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
            var ruleLength;

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
        var tokens = this._tree.tokens;
        var tokenIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenIndex[tokens[i].range[0]] = i;
            tokens[i]._tokenIndex = i;
        }
        this._tokenIndex = tokenIndex;
    },
    /**
     * Returns token position using range start from the index.
     *
     * @returns {Object}
     */
    getTokenPosByRangeStart: function(start) {
        return this._tokenIndex[start];
    },
    /**
     * Returns token using range start from the index.
     *
     * @returns {Object|undefined}
     */
    getTokenByRangeStart: function(start) {
        var tokenIndex = this._tokenIndex[start];
        return tokenIndex === undefined ? undefined : this._tree.tokens[tokenIndex];
    },
    /**
     * Returns first token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getFirstNodeToken: function(node) {
        return this.getTokenByRangeStart(node.range[0]);
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
        while (prevToken && prevToken.type !== type && (value === undefined ? true : prevToken.value !== value)) {
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
        while (nextToken && nextToken.type !== type && (value === undefined ? true : nextToken.value !== value)) {
            nextToken = this.getNextToken(nextToken);
        }
        return nextToken;
    },
    /**
     * Iterates through the token tree using tree iterator.
     * Calls passed function for every token.
     *
     * @param {Function} cb
     * @param {Function} [tree]
     */
    iterate: function(cb, tree) {
        return treeIterator.iterate(tree || this._tree, cb);
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
            if (nameIndex[token.value]) {
                cb(token, index, tokens);
            }
        });
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
    }
};

module.exports = JsFile;
