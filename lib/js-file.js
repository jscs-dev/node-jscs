// var assert = require('assert');
var escope = require('escope');
var cst = require('cst');
var Parser = cst.Parser;
var Token = cst.Token;
var Fragment = cst.Fragment;

var treeIterator = require('./tree-iterator');

// var Program = cst.types.Program;

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

    var parser = new Parser({
        strictMode: false,
        languageExtensions: {
            gritDirectives: true,
            appleInstrumentationDirectives: true
        }
    });

    try {
        this._program = parser.parse(this._source);
    } catch (e) {
        this._parseErrors.push(e);
        // this._program = new Program([]);
    }

    // Lazy initialization
    this._scope = null;
    // TODO: 3.0
    // this._buildDisabledRuleIndex();
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

        // Matches a comment enabling or disabling rules.
        var blockRe = /(jscs\s*:\s*(en|dis)able)(.*)/;

        // Matches a comment disbling a rule for one line.
        var lineRe = /(jscs\s*:\s*ignore)(.*)/;

        comments.forEach(function(comment) {
            var enabled;
            var value = comment.value.trim();
            var blockParsed = blockRe.exec(value);
            var lineParsed = lineRe.exec(value);
            var line = comment.loc.start.line;

            if (blockParsed && blockParsed.index === 0) {
                enabled = blockParsed[2] === 'en';
                this._addToDisabledRuleIndex(enabled, blockParsed[3], line);

            } else if (lineParsed && lineParsed.index === 0) {
                this._disableRulesAt(lineParsed[2], line);
            }

        }, this);
    },

    /**
     * Sets whitespace before specified token.
     *
     * @param {Object} token - in front of which we will add/remove/replace the whitespace token
     * @param {String} whitespace - value of the whitespace token - `\n`, `\s`, `\t`
     */
    setWhitespaceBefore: function(token, whitespace) {
        var prevToken = token.previousToken;
        var ws = new Token('Whitespace', whitespace);
        var fragment = new Fragment(ws);

        if (prevToken && prevToken.isWhitespace) {
            if (whitespace === '') {
                prevToken.remove();
                return;
            }

            prevToken.parentElement.replaceChild(fragment, prevToken);
            return;
        }

        this._setTokenBefore(token, fragment);
    },

    _setTokenBefore: function(token, fragment) {
        var parent = token;
        var grandpa = parent.parentElement;

        while (grandpa) {
            try {
                grandpa.insertChildBefore(fragment, parent);
                break;
            } catch (e) {}

            parent = grandpa;
            grandpa = parent.parentElement;
        }
    },

    /**
     * Returns whitespace before specified token.
     *
     * @param {Object} token
     * @returns {String}
     */
    getWhitespaceBefore: function(token) {
        var prev = token.previousToken;

        if (prev && prev.isWhitespace) {
            return prev.sourceCode;
        }

        return '';
    },

    /**
     * Disables a rules for a single line, not re-enabling any disabled rules
     *
     * @private
     */
    _disableRulesAt: function(rules, line) {
        rules = rules.split(/\s*,\s*/);
        for (var i = 0; i < rules.length; i++) {
            if (!this.isEnabledRule(rules[i], line)) {
                continue;
            }

            this._addToDisabledRuleIndex(false, rules[i], line);
            this._addToDisabledRuleIndex(true, rules[i], line + 1);
        }
    },

    /**
     * Returns whether a specific rule is disabled on the given line.
     *
     * @param {String} ruleName the rule name being tested
     * @param {Element} element the element being tested
     * @returns {Boolean} true if the rule is enabled
     */
    isEnabledRule: function(/*ruleName, element*/) {
        return true;
        // TODO: 3.0
        // var enabled = true;
        // ruleName = ruleName.trim();

        // this._disabledRuleIndex.some(function(region) {
        //     // once the comment we're inspecting occurs after the location of the error,
        //     // no longer check for whether the state is enabled or disable
        //     if (region.line > line) {
        //         return true;
        //     }

        //     if (region.rule === ruleName || region.rule === '*') {
        //         enabled = region.enabled;
        //     }
        // }, this);

        // return enabled;
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
     * @param {Option} [options]
     * @param {Boolean} [options.includeComments=false]
     * @param {Boolean} [options.includeWhitespace=false]
     * @returns {Object}
     */
    getFirstToken: function(/*options*/) {
        return this._program.firstToken;
    },

    /**
     * Returns the last token for the file.
     *
     * @param {Option} [options]
     * @param {Boolean} [options.includeComments=false]
     * @param {Boolean} [options.includeWhitespace=false]
     * @returns {Object}
     */
    getLastToken: function(/*options*/) {
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
        }

        return token.previousCodeToken;
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
     * @returns {Object|null}
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
     * @returns {Object|null}
     */
    findNextToken: function(token, type, value) {
        var nextToken = token.nextToken;

        while (nextToken) {
            if (nextToken.type === type && (value === undefined || nextToken.value === value)) {
                return nextToken;
            }

            nextToken = nextToken.nextToken;
        }
        return nextToken;
    },

    /**
     * Returns the first token before the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} value
     * @returns {Object|null}
     */
    findPrevOperatorToken: function(token, value) {
        return this.findPrevToken(token, value in KEYWORD_OPERATORS ? 'Keyword' : 'Punctuator', value);
    },

    /**
     * Returns the first token after the given which matches type (and value).
     *
     * @param {Object} token
     * @param {String} value
     * @returns {Object|null}
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
     * Returns nodes by type(s) from earlier built index.
     *
     * @param {String|String[]} type
     * @returns {Object[]}
     */
    getNodesByType: function(type) {
        type = Array.isArray(type) ? type : [type];
        var result = [];

        for (var i = 0, l = type.length; i < l; i++) {
            var nodes = this._program.selectNodesByType(type[i]);

            if (nodes) {
                result = result.concat(nodes);
            }
        }

        return result;
    },

    /**
     * Iterates nodes by type(s) from earlier built index.
     * Calls passed function for every matched node.
     *
     * @param {String|String[]} type
     * @param {Function} cb
     * @param {Object} context
     */
    iterateNodesByType: function(type, cb, context) {
        return this.getNodesByType(type).forEach(cb, context || this);
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
     * @param {Boolean} [options.includeWhitespace = false]
     * @returns {Object|null}
     */
    getFirstTokenOnLine: function(lineNumber, options) {
        options = options || {};

        var loc;
        var token = this._program.firstToken;
        var currentToken

        while (token) {
            loc = token.loc;
            currentToken = token;
            token = token.nextToken;

            if (loc.start.line <= lineNumber && loc.end.line >= lineNumber) {

                // Since whitespace tokens can contain newlines we need to check
                // if position is in the range, not exact match
                if (currentToken.isWhitespace && !options.includeWhitespace) {
                    continue;
                }
            }

            if (loc.start.line === lineNumber || loc.end.line === lineNumber) {
                if (currentToken.isComment && !options.includeComments) {
                    continue;
                }

                return currentToken;
            }
        }

        return null;
    },

    /**
     * Returns last token for the specified line.
     * Line numbers start with 1.
     *
     * @param {Number} lineNumber
     * @param {Object} [options]
     * @param {Boolean} [options.includeComments = false]
     * @param {Boolean} [options.includeWhitespace = false]
     * @returns {Object|null}
     */
    getLastTokenOnLine: function(lineNumber, options) {
        options = options || {};

        var loc;
        var token = this._program.lastToken;
        var currentToken;

        while (token) {
            loc = token.loc;
            currentToken = token;
            token = token.previousToken;

            if (loc.start.line <= lineNumber && loc.end.line >= lineNumber) {

                // Since whitespace tokens can contain newlines we need to check
                // if position is in the range, not exact match
                if (currentToken.isWhitespace && !options.includeWhitespace) {
                    continue;
                }
            }

            if (loc.start.line === lineNumber || loc.end.line === lineNumber) {
                if (currentToken.isComment && !options.includeComments) {
                    continue;
                }

                return currentToken;
            }
        }

        return null;
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
     * Returns token program.
     *
     * @returns {Object}
     */
    getTree: function() {
        return this._program || {};
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
     * Returns analyzed scope.
     *
     * @returns {Object}
     */
    getScope: function() {
        if (!this._scope) {
            this._scope = escope.analyze(this._tree, {
                ecmaVersion: 6,
                ignoreEval: true,
                sourceType: 'module'
            });
        }

        return this._scope;
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
                // Remove tralling spaces (see gh-1968)
                lines[i] = lines[i].replace(/\*\/\s+/, '\*\/');
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

module.exports = JsFile;
