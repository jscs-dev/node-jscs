// var assert = require('assert');
var cst = require('cst');
var Parser = cst.Parser;
var Token = cst.Token;
var Program = cst.types.Program;
var Fragment = cst.Fragment;
var ScopesApi = cst.api.ScopesApi;

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
 * @param {Boolean} [params.es3]
 */
var JsFile = function(params) {
    params = params || {};
    this._parseErrors = [];
    this._filename = params.filename;
    this._source = params.source;

    this._es3 = params.es3 || false;

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
        this._program = new Program([
            new Token('EOF', '')
        ]);
    }

    // Lazy initialization
    this._scopes = null;
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
     * Sets whitespace before specified token.
     *
     * @param {Object} token - in front of which we will add/remove/replace the whitespace token
     * @param {String} whitespace - value of the whitespace token - `\n`, `\s`, `\t`
     */
    setWhitespaceBefore: function(token, whitespace) {
        var prevToken = token.getPreviousToken();
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
        if (!token.getPreviousToken) {
            console.log(token);
        }
        var prev = token.getPreviousToken();

        if (prev && prev.isWhitespace) {
            return prev.getSourceCode();
        }

        return '';
    },

    /**
     * Returns the first token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getFirstNodeToken: function(node) {
        return node.getFirstToken();
    },

    /**
     * Returns the last token for the node from the AST.
     *
     * @param {Object} node
     * @returns {Object}
     */
    getLastNodeToken: function(node) {
        return node.getLastToken();
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
        return this._program.getFirstToken();
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
        return this._program.getLastToken();
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
            return token.getPreviousNonWhitespaceToken();
        }

        return token.getPreviousCodeToken();
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
            return token.getNextNonWhitespaceToken();
        } else {
            return token.getNextCodeToken();
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
        var nextToken = token.getNextToken();

        while (nextToken) {
            if (nextToken.type === type && (value === undefined || nextToken.value === value)) {
                return nextToken;
            }

            nextToken = nextToken.getNextToken();
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

    getFirstTokenOnLineWith: function(element, options) {
        options = options || {};
        var firstToken = element;

        if (element.isComment && !options.includeComments) {
            firstToken = null;
        }

        if (element.isWhitespace && !options.includeWhitespace) {
            firstToken = null;
        }

        var currentToken = element.getPreviousToken();
        while (currentToken) {
            if (currentToken.isWhitespace) {
                if (currentToken.getNewlineCount() > 0 || !currentToken.getPreviousToken()) {
                    if (options.includeWhitespace) {
                        firstToken = currentToken;
                    }
                    break;
                }
            } else if (currentToken.isComment) {
                if (options.includeComments) {
                    firstToken = currentToken;
                    break;
                }
                if (currentToken.getNewlineCount() > 0) {
                    break;
                }
            } else {
                firstToken = currentToken;
            }

            currentToken = currentToken.getPreviousToken();
        }

        if (firstToken) {
            return firstToken;
        }

        currentToken = element.getNextToken();
        while (currentToken) {
            if (currentToken.isWhitespace) {
                if (currentToken.getNewlineCount() > 0 || !currentToken.getNextToken()) {
                    if (options.includeWhitespace) {
                        firstToken = currentToken;
                    }
                    break;
                }
            } else if (currentToken.isComment) {
                if (options.includeComments) {
                    firstToken = currentToken;
                    break;
                }
                if (currentToken.getNewlineCount() > 0) {
                    break;
                }
            } else {
                firstToken = currentToken;
            }

            currentToken = currentToken.getNextToken();
        }

        return firstToken;
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
        var token = this._program.getLastToken();
        var currentToken;

        while (token) {
            loc = token.getLoc();
            currentToken = token;
            token = token.getPreviousToken();

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
        if (this._es3) {
            return 'es3';
        }

        return 'es6';
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
     * Returns comment token list.
     */
    getComments: function() {
        var comments = [];
        var token = this._program.getFirstToken();
        while (token) {
            if (token.isComment) {
                comments[comments.length] = token;
            }
            token = token.getNextToken();
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
    getScopes: function() {
        if (!this._scopes) {
            this._scopes = new ScopesApi(this._program);
        }

        return this._scopes;
    },

    /**
     * Are tokens on the same line.
     *
     * @param {Element} tokenBefore
     * @param {Element} tokenAfter
     * @return {Boolean}
     */
    isOnTheSameLine: function(tokenBefore, tokenAfter) {
        if (tokenBefore === tokenAfter) {
            return true;
        }
        tokenBefore = tokenBefore instanceof Token ? tokenBefore : tokenBefore.getLastToken();
        tokenAfter = tokenAfter instanceof Token ? tokenAfter : tokenAfter.getFirstToken();
        var currentToken = tokenBefore;
        while (currentToken) {
            if (currentToken === tokenAfter) {
                return true;
            }
            if (currentToken !== tokenBefore && currentToken.getNewlineCount() > 0) {
                return false;
            }
            currentToken = currentToken.getNextToken();
        }
        return false;
    },

    getDistanceBetween: function(tokenBefore, tokenAfter) {
        if (tokenBefore === tokenAfter) {
            return 0;
        }
        tokenBefore = tokenBefore instanceof Token ? tokenBefore : tokenBefore.getLastToken();
        tokenAfter = tokenAfter instanceof Token ? tokenAfter : tokenAfter.getFirstToken();
        var currentToken = tokenBefore.getNextToken();
        var distance = 0;
        while (currentToken) {
            if (currentToken === tokenAfter) {
                break;
            }

            distance += currentToken.getSourceCodeLength();
            currentToken = currentToken.getNextToken();
        }
        return distance;
    },

    getLineCountBetween: function(tokenBefore, tokenAfter) {
        if (tokenBefore === tokenAfter) {
            return 0;
        }
        tokenBefore = tokenBefore instanceof Token ? tokenBefore : tokenBefore.getLastToken();
        tokenAfter = tokenAfter instanceof Token ? tokenAfter : tokenAfter.getFirstToken();

        var currentToken = tokenBefore.getNextToken();
        var lineCount = 0;
        while (currentToken) {
            if (currentToken === tokenAfter) {
                break;
            }

            lineCount += currentToken.getNewlineCount();
            currentToken = currentToken.getNextToken();
        }
        return lineCount;
    },

    /**
     * Returns array of source lines for the file with comments removed.
     *
     * @returns {Array}
     */
    getLinesWithCommentsRemoved: function() {
        var lines = this.getLines().concat();

        this.getComments().concat().reverse().forEach(function(comment) {
            var loc = comment.getLoc();
            var startLine = loc.start.line;
            var startCol = loc.start.column;
            var endLine = loc.end.line;
            var endCol = loc.end.column;
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
        return this._program.getSourceCode();
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
