!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.JscsStringChecker=e():"undefined"!=typeof global?global.JscsStringChecker=e():"undefined"!=typeof self&&(self.JscsStringChecker=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var colors = require('colors');

/**
 * Set of errors for specified file.
 *
 * @name Errors
 */
var Errors = function(file) {
    this._errorList = [];
    this._file = file;
};

Errors.prototype = {
    /**
     * Adds style error to the list
     *
     * @param {String} message
     * @param {Number|Object} line
     * @param {Number} [column]
     */
    add: function(message, line, column) {
        if (typeof line === 'object') {
            column = line.column;
            line = line.line;
        }
        this._errorList.push({
            message: message,
            line: line,
            column: column
        });
    },

    /**
     * Returns style error list.
     *
     * @returns {Object[]}
     */
    getErrorList: function() {
        return this._errorList;
    },

    /**
     * Returns filename of file this error list is for.
     *
     * @returns {String}
     */
    getFilename: function() {
        return this._file.getFilename();
    },

    /**
     * Returns true if no errors are added.
     *
     * @returns {Boolean}
     */
    isEmpty: function() {
        return this._errorList.length === 0;
    },

    /**
     * Returns amount of errors added by the rules.
     *
     * @returns {Number}
     */
    getErrorCount: function () {
        return this._errorList.length;
    },

    /**
     * Formats error for futher output.
     *
     * @param {Object} error
     * @param {Boolean} colorize
     * @returns {String}
     */
    explainError: function(error, colorize) {
        var lineNumber = error.line - 1;
        var lines = this._file.getLines();
        var result = [
            renderLine(lineNumber, lines[lineNumber], colorize),
            renderPointer(error.column, colorize)
        ];
        var i = lineNumber - 1;
        var linesAround = 2;
        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i], colorize));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i], colorize));
            i++;
        }
        result.unshift(formatErrorMessage(error.message, this.getFilename(), colorize));
        return result.join('\n');
    }

};

/**
 * Formats error message header.
 *
 * @param {String} message
 * @param {String} filename
 * @param {Boolean} colorize
 * @returns {String}
 */
function formatErrorMessage(message, filename, colorize) {
    return (colorize ? colors.bold(message) : message) +
        ' at ' +
        (colorize ? colors.green(filename) : filename) + ' :';
}

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderLine(n, line, colorize) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, ' ');

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return ' ' + (colorize ? colors.grey(lineNumber) : lineNumber) + line;
}

/**
 * Renders pointer:
 * ---------------^
 *
 * @param {Number} column
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderPointer(column, colorize) {
    var res = (new Array(column + 9)).join('-') + '^';
    return colorize ? colors.grey(res) : res;
}

module.exports = Errors;

},{"colors":64}],2:[function(require,module,exports){
var treeIterator = require('./tree-iterator');

/**
 * File representation for JSCS.
 *
 * @name JsFile
 */
var JsFile = function(filename, source, tree) {
    this._filename = filename;
    this._source = source;
    this._tree = tree;
    this._lines = source.split(/\r\n|\r|\n/);
    this._tokenIndex = null;
    var index = this._index = {};
    this.iterate(function(node, parentNode, parentCollection) {
        if (node) {
            var type = node.type;
            if (type) {
                node.parentNode = parentNode;
                node.parentCollection = parentCollection;
                (index[type] || (index[type] = [])).push(node);
            }
        }
    });
};

JsFile.prototype = {
    /**
     * Builds token index by starting pos for futher navigation.
     */
    _buildTokenIndex: function() {
        var tokens = this._tree.tokens;
        var tokenIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenIndex[tokens[i].range[0]] = i;
        }
        this._tokenIndex = tokenIndex;
    },
    /**
     * Returns token position using range start from the index.
     *
     * @returns {Object}
     */
    getTokenPosByRangeStart: function(start) {
        if (!this._tokenIndex) {
            this._buildTokenIndex();
        }
        return this._tokenIndex[start];
    },
    /**
     * Iterates through the token tree using tree iterator.
     * Calls passed function for every token.
     *
     * @param {Function} cb
     */
    iterate: function(cb) {
        return treeIterator.iterate(this._tree, cb);
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

},{"./tree-iterator":59}],3:[function(require,module,exports){
module.exports={
    "requireCurlyBraces": [ "if", "else", "for", "while", "do" ],
    "requireSpaceAfterKeywords": [ "if", "else", "for", "while", "do", "switch", "return" ],
    "requireSpacesInFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },
    "disallowSpacesInFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "requireMultipleVarDecl": true,
    "requireSpacesInsideObjectBrackets": "all",
    "requireSpacesInsideArrayBrackets": "all",
    "disallowLeftStickedOperators": [ "?", "-", "/", "*", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<=" ],
    "disallowRightStickedOperators": [ "?", "/", "*", ":", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<="],
    "requireSpaceBeforeBinaryOperators": ["+", "-", "/", "*", "=", "==", "===", "!=", "!=="],
    "disallowSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-"],
    "disallowSpaceBeforePostfixUnaryOperators": ["++", "--"],
    "requireRightStickedOperators": [ "!" ],
    "requireLeftStickedOperators": [ "," ],
    "disallowKeywords": [ "with" ],
    "disallowMultipleLineBreaks": true,
    "disallowKeywordsOnNewLine": [ "else" ],
    "requireLineFeedAtFileEnd": true,
    "disallowSpaceAfterObjectKeys": true,
    "validateLineBreaks": "LF"
}

},{}],4:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowCommaBeforeLineBreak) {
        assert(
            typeof disallowCommaBeforeLineBreak === 'boolean',
            'disallowCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            disallowCommaBeforeLineBreak === true,
            'disallowCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.loc.start.line !== token.loc.end.line) {
                    errors.add(
                        'Commas should be placed on new line',
                        token.loc.end.line,
                        token.loc.end.column
                    );
                }
            }
        });
    }

};

},{"assert":62}],5:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowDanglingUnderscores) {
        assert(
            typeof disallowDanglingUnderscores === 'boolean',
            'disallowDanglingUnderscores option requires boolean value'
        );
        assert(
            disallowDanglingUnderscores === true,
            'disallowDanglingUnderscores option requires true value or should be removed'
        );

        this._allowedIdentifiers = {
            _: true,
            __dirname: true,
            __filename: true
        };
    },

    getOptionName: function () {
        return 'disallowDanglingUnderscores';
    },

    check: function(file, errors) {
        var allowedIdentifiers = this._allowedIdentifiers;

        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if ((value[0] === '_' || value.slice( -1 ) === '_') &&
                !allowedIdentifiers[value]
            ) {
                errors.add(
                    'Invalid dangling underscore found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};

},{"assert":62}],6:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowEmptyBlocks) {
        assert(
            typeof disallowEmptyBlocks === 'boolean',
            'disallowEmptyBlocks option requires boolean value'
        );
        assert(
            disallowEmptyBlocks === true,
            'disallowEmptyBlocks option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowEmptyBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length === 0 && node.parentNode.type !== 'CatchClause') {
                errors.add('Empty block found', node.loc.end);
            }
        });
    }

};

},{"assert":62}],7:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(types) {
        assert(Array.isArray(types), 'disallowImplicitTypeConversion option requires array value');
        this._typeIndex = {};
        for (var i = 0, l = types.length; i < l; i++) {
            this._typeIndex[types[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowImplicitTypeConversion';
    },

    check: function(file, errors) {
        var types = this._typeIndex;
        if (types.numeric || types.boolean || types.binary) {
            file.iterateNodesByType('UnaryExpression', function (node) {
                if (types.numeric && node.operator === '+') {
                    errors.add('Implicit numeric conversion', node.loc.start);
                }
                if (types.binary && node.operator === '~') {
                    errors.add('Implicit binary conversion', node.loc.start);
                }
                if (types.boolean &&
                    node.operator === '!' &&
                    node.argument.type === 'UnaryExpression' &&
                    node.argument.operator === '!'
                ) {
                    errors.add('Implicit boolean conversion', node.loc.start);
                }
            });
        }
        if (types.string) {
            file.iterateNodesByType('BinaryExpression', function (node) {
                if (node.operator === '+' && (
                        (node.left.type === 'Literal' && node.left.value === '') ||
                        (node.right.type === 'Literal' && node.right.value === '')
                    )
                ) {
                    errors.add('Implicit string conversion', node.loc.start);
                }
            });
        }
    }

};

},{"assert":62}],8:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowKeywordsOnNewLine';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Keyword `' + token.value + '` should not be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};

},{"assert":62}],9:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token) {
            if (keywordIndex[token.value]) {
                errors.add(
                    'Illegal keyword: ' + token.value,
                    token.loc.start
                );
            }
        });
    }

};

},{"assert":62}],10:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowLeftStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowLeftStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.range[1] === token.range[0]) {
                    errors.add(
                        'Operator ' + token.value + ' should not stick to preceding expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],11:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMixedSpacesAndTabs) {
        assert(
            disallowMixedSpacesAndTabs === true || disallowMixedSpacesAndTabs === 'smart',
            'disallowMixedSpacesAndTabs option requires true or "smart" value'
        );

        this._disallowMixedSpacesAndTabs = disallowMixedSpacesAndTabs;
    },

    getOptionName: function () {
        return 'disallowMixedSpacesAndTabs';
    },

    check: function(file, errors) {
        var disallowMixedSpacesAndTabs = this._disallowMixedSpacesAndTabs;

        var lines = file.getLines().concat();

        var test = disallowMixedSpacesAndTabs === true ?
            (/ \t|\t [^\*]|\t $/) :
            (/ \t/);

        // remove comments from the code
        var comments = file.getComments();
        if (comments) {
            comments.forEach(function(comment) {
                var loc = comment.loc;
                var start = loc.start;
                var end = loc.end;
                var startIndex = start.line - 1;

                if (comment.type === 'Line') {
                    lines[startIndex] = lines[startIndex].substring(0, start.column);
                } else if (start.line !== end.line) {
                    // docblocks have a star as their first character
                    // and should *NOT* remove the star on subsequent lines
                    // to cause the regex to not catch an error: \t [^\*]
                    // but regular multilines should remove the star to catch an error
                    var substringOffset = comment.value.indexOf('*') === 0 ? 2 : 1;

                    for (var x = startIndex; x < end.line; x++) {
                        // remove all multine content to the right of the star
                        var starPos = lines[x].search(/ \*/);
                        if (starPos > -1) {
                            starPos += substringOffset;
                            lines[x] = lines[x].substring(0, starPos);
                        }
                    }
                }
            });
        }

        lines.forEach(function(line, i) {
            if (line.match(test)) {
                errors.add('Mixed spaces and tabs found', i + 1);
            }
        });
    }

};

},{"assert":62}],12:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleLineBreaks) {
        assert(
            typeof disallowMultipleLineBreaks === 'boolean',
            'disallowMultipleLineBreaks option requires boolean value'
        );
        assert(
            disallowMultipleLineBreaks === true,
            'disallowMultipleLineBreaks option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowMultipleLineBreaks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        for (var i = 1, l = lines.length; i < l; i++) {
            var line = lines[i];
            if (line === '' && lines[i - 1] === '') {
                while (++i < l && lines[i] === '') {}
                errors.add('Multiple line break', i - 1, 0);
            }
        }
    }

};

},{"assert":62}],13:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleLineStrings) {
        assert(
            typeof disallowMultipleLineStrings === 'boolean',
            'disallowMultipleLineStrings option requires boolean value'
        );
        assert(
            disallowMultipleLineStrings === true,
            'disallowMultipleLineStrings option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowMultipleLineStrings';
    },

    check: function(file, errors) {
        file.iterateTokensByType('String', function(token) {
            if (token.loc.start.line !== token.loc.end.line) {
                errors.add(
                    'Multiline strings are disallowed.',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};

},{"assert":62}],14:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(
            typeof disallowMultipleVarDecl === 'boolean',
            'disallowMultipleVarDecl option requires boolean value'
        );
        assert(
            disallowMultipleVarDecl === true,
            'disallowMultipleVarDecl option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            // allow multiple var declarations in for statement
            // for (var i = 0, j = myArray.length; i < j; i++) {}
            if (node.declarations.length > 1 && node.parentNode.type !== 'ForStatement') {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};

},{"assert":62}],15:[function(require,module,exports){
var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            disallowQuotedKeysInObjects === true || disallowQuotedKeysInObjects === 'allButReserved',
            this.getOptionName() + ' options should be "true" or an array of exceptions'
        );

        this._mode = disallowQuotedKeysInObjects;
    },

    getOptionName: function() {
        return 'disallowQuotedKeysInObjects';
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^(0|[1-9][0-9]*|[a-zA-Z_$]+[\w$]*)$/; // number or identifier
        var mode = this._mode;

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (key.type === 'Literal' &&
                    typeof key.value === 'string' &&
                    KEY_NAME_RE.test(key.value)
                ) {
                    if (mode === 'allButReserved' &&
                        (utils.isEs3Keyword(key.value) || utils.isEs3FutureReservedWord(key.value))
                    ) {
                        return;
                    }
                    errors.add('Extra quotes for key', prop.loc.start);
                }
            });
        });
    }

};

},{"../utils":60,"assert":62}],16:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowRightStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowRightStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    errors.add(
                        'Operator ' + token.value + ' should not stick to following expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],17:[function(require,module,exports){
var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowSpaceAfterBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function (node) {
            if (operators[node.operator]) {
                // get token before right part of expression
                var tokenBeforeRightPart = tokenHelper.getTokenByRangeStart(file, node.right.range[0] - 1, true);

                if (!tokenHelper.tokenIsPunctuator(tokenBeforeRightPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to following expression',
                        node.right.loc.start
                    );
                }
            }
        });
    }

};

},{"../token-helper":58,"assert":62}],18:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] !== token.range[1]) {
                    errors.add(
                        'Illegal space after `' + token.value + '` keyword',
                        nextToken.loc.start.line,
                        nextToken.loc.start.column
                    );
                }
            }
        });
    }

};

},{"assert":62}],19:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var key = property.key;
                var keyPos = file.getTokenPosByRangeStart(key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.range[0] !== key.range[1]) {
                    errors.add('Illegal space after key', key.loc.end);
                }
            });
        });
    }

};

},{"assert":62}],20:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function (node) {
            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operatorIndex[node.operator]) {
                var operatorTokenIndex = file.getTokenPosByRangeStart(node.range[0]);
                var operatorToken = tokens[operatorTokenIndex];
                var nextToken = tokens[operatorTokenIndex + 1];
                if (operatorToken.range[1] !== nextToken.range[0]) {
                    errors.add('Operator ' + node.operator + ' should stick to operand', node.loc.start);
                }
            }
        });
    }
};

},{"assert":62}],21:[function(require,module,exports){
var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowSpaceBeforeBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function (node) {
            if (operators[node.operator]) {
                // get token after left part of expression
                var tokenAfterLeftPart = tokenHelper.getTokenByRangeStart(file, node.left.range[1]);

                if (!tokenHelper.tokenIsPunctuator(tokenAfterLeftPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to following expression',
                        node.left.loc.start
                    );
                }
            }
        });
    }

};

},{"../token-helper":58,"assert":62}],22:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'disallowSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function (node) {
            // "!node.prefix" means postfix type of (inc|dec)rement
            if (!node.prefix && operatorIndex[node.operator]) {
                var operatorStartPos = node.range[1] - node.operator.length;
                var operatorTokenIndex = file.getTokenPosByRangeStart(operatorStartPos);
                var operatorToken = tokens[operatorTokenIndex];
                var prevToken = tokens[operatorTokenIndex - 1];
                if (operatorToken.range[0] !== prevToken.range[1]) {
                    errors.add('Operator ' + node.operator + ' should stick to operand', node.loc.start);
                }
            }
        });
    }
};

},{"assert":62}],23:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'disallowSpacesInFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'disallowSpacesInFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'disallowSpacesInFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'disallowSpacesInFunctionExpression must have beforeOpeningCurlyBrace or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function () {
        return 'disallowSpacesInFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType([ 'FunctionDeclaration', 'FunctionExpression' ], function (node) {

            if (beforeOpeningRoundBrace) {
                var nodeBeforeRoundBrace = node;
                // named function
                if (node.id) {
                    nodeBeforeRoundBrace = node.id;
                }

                var functionTokenPos = file.getTokenPosByRangeStart(nodeBeforeRoundBrace.range[0]);
                var functionToken = tokens[functionTokenPos];

                var nextTokenPos = file.getTokenPosByRangeStart(functionToken.range[1]);
                var nextToken = tokens[nextTokenPos];

                if (!nextToken) {
                    errors.add(
                        'Illegal space before opening round brace',
                        functionToken.loc.start
                    );
                }
            }

            if (beforeOpeningCurlyBrace) {
                var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.body.range[0] - 1);
                var tokenBeforeBody = tokens[tokenBeforeBodyPos];

                if (!tokenBeforeBody) {
                    errors.add(
                        'Illegal space before opening curly brace',
                        node.body.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],24:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ArrayExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line === nextToken.loc.start.line &&
                openingBracket.range[1] !== nextToken.range[0]
            ) {
                errors.add('Illegal space after opening square brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line &&
                closingBracket.range[0] !== prevToken.range[1]
            ) {
                errors.add('Illegal space before closing square brace', prevToken.loc.end);
            }
        });
    }

};

},{"assert":62}],25:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideObjectBrackets) {
        assert(
            typeof disallowSpacesInsideObjectBrackets === 'boolean',
            'disallowSpacesInsideObjectBrackets option requires boolean value'
        );
        assert(
            disallowSpacesInsideObjectBrackets === true,
            'disallowSpacesInsideObjectBrackets option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideObjectBrackets';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line === nextToken.loc.start.line &&
                openingBracket.range[1] !== nextToken.range[0]
            ) {
                errors.add('Illegal space after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line &&
                closingBracket.range[0] !== prevToken.range[1]
            ) {
                errors.add('Illegal space before closing curly brace', prevToken.loc.end);
            }
        });
    }

};

},{"assert":62}],26:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideParentheses) {
        assert(
            typeof disallowSpacesInsideParentheses === 'boolean',
            'disallowSpacesInsideParentheses option requires boolean value'
        );
        assert(
            disallowSpacesInsideParentheses === true,
            'disallowSpacesInsideParentheses option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideParentheses';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, index, tokens) {
            if (token.value === '(') {
                var nextToken = tokens[index + 1];
                if (token.range[1] !== nextToken.range[0] &&
                        token.loc.end.line === nextToken.loc.start.line) {
                    errors.add('Illegal space after opening round bracket', token.loc.end);
                }
            }

            if (token.value === ')') {
                var prevToken = tokens[index - 1];
                if (prevToken.range[1] !== token.range[0] &&
                        prevToken.loc.end.line === token.loc.start.line) {
                    errors.add('Illegal space before closing round bracket', prevToken.loc.end);
                }
            }
        });
    }

};

},{"assert":62}],27:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowTrailingWhitespace) {
        assert(
            typeof disallowTrailingWhitespace === 'boolean',
            'disallowTrailingWhitespace option requires boolean value'
        );
        assert(
            disallowTrailingWhitespace === true,
            'disallowTrailingWhitespace option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'disallowTrailingWhitespace';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].match(/\s$/)) {
                errors.add('Illegal trailing whitespace', i + 1, lines[i].length);
            }
        }
    }

};

},{"assert":62}],28:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowYodaConditions) {
        assert(
            typeof disallowYodaConditions === 'boolean',
            'disallowYodaConditions option requires boolean value'
        );
        assert(
            disallowYodaConditions === true,
            'disallowYodaConditions option requires true value or should be removed'
        );
        this._operatorIndex = {
            '==': true,
            '===': true,
            '!=': true,
            '!==': true,
            '>': true,
            '<': true,
            '>=': true,
            '<=': true
        };
    },

    getOptionName: function () {
        return 'disallowYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function (node) {
            if (operators[node.operator]) {
                if (node.left.type === 'Literal' ||
                    (node.left.type === 'Identifier' && node.left.name === 'undefined')
                ) {
                    errors.add('Yoda condition', node.left.loc.start);
                }
            }
        });
    }

};

},{"assert":62}],29:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(maximumLineLength) {
        assert(
            typeof maximumLineLength === 'number',
            'maximumLineLength option requires number value'
        );

        this._maximumLineLength = maximumLineLength;
    },

    getOptionName: function () {
        return 'maximumLineLength';
    },

    check: function(file, errors) {
        var maximumLineLength = this._maximumLineLength;

        var lines = file.getLines();
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].length > maximumLineLength) {
                errors.add('Line must be at most ' + maximumLineLength + ' characters', i + 1, 0);
            }
        }
    }

};

},{"assert":62}],30:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'skipWithFunction': true,
            'skipWithLineBreak': true
        };
        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + ' option requires string value \'skipWithFunction\' or \'skipWithLineBreak\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireAlignedObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            if (node.loc.start.line === node.loc.end.line || node.properties < 2) {
                return;
            }

            var skip = false;
            var maxKeyEndPos = 0;

            node.properties.forEach(function(property, index) {
                var keyEndPos = property.key.loc.end.column;
                if (keyEndPos > maxKeyEndPos) {
                    maxKeyEndPos = keyEndPos;
                }
                skip = skip || (mode === 'skipWithFunction' && property.value.type === 'FunctionExpression') ||
                    (mode === 'skipWithLineBreak' && index > 0 &&
                     node.properties[index - 1].loc.end.line !== property.loc.start.line - 1);
            });

            if (skip) {
                return;
            }

            node.properties.forEach(function(property) {
                var keyPos = file.getTokenPosByRangeStart(property.key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.loc.start.column !== maxKeyEndPos + 1) {
                    errors.add('Alignment required', colon.loc.start);
                }
            });
        });
    }

};

},{"assert":62}],31:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCamelCaseOrUpperCaseIdentifiers) {
        assert(
            typeof requireCamelCaseOrUpperCaseIdentifiers === 'boolean',
            'requireCamelCaseOrUpperCaseIdentifiers option requires boolean value'
        );
        assert(
            requireCamelCaseOrUpperCaseIdentifiers === true,
            'requireCamelCaseOrUpperCaseIdentifiers option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') > -1 && value.toUpperCase() !== value) {
                errors.add(
                    'All identifiers must be camelCase or UPPER_CASE',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};

},{"assert":62}],32:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCapitalizedConstructors) {
        assert(
            typeof requireCapitalizedConstructors === 'boolean',
            'requireCapitalizedConstructors option requires boolean value'
        );
        assert(
            requireCapitalizedConstructors === true,
            'requireCapitalizedConstructors option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireCapitalizedConstructors';
    },

    check: function(file, errors) {
        file.iterateNodesByType('NewExpression', function(node) {
            if (node.callee.type === 'Identifier' &&
                node.callee.name[0].toUpperCase() !== node.callee.name[0]
            ) {
                errors.add(
                    'Constructor functions should be capitalized',
                    node.callee.loc.start.line,
                    node.callee.loc.start.column
                );
            }
        });
    }

};

},{"assert":62}],33:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCommaBeforeLineBreak) {
        assert(
            typeof requireCommaBeforeLineBreak === 'boolean',
            'requireCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            requireCommaBeforeLineBreak === true,
            'requireCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Commas should not be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};

},{"assert":62}],34:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(statementTypes) {
        assert(Array.isArray(statementTypes), 'requireCurlyBraces option requires array value');
        this._typeIndex = {};
        for (var i = 0, l = statementTypes.length; i < l; i++) {
            this._typeIndex[statementTypes[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireCurlyBraces';
    },

    check: function(file, errors) {

        function addError(typeString, node) {
            errors.add(
                typeString + ' statement without curly braces',
                node.loc.start.line,
                node.loc.start.column
            );
        }

        function checkBody(type, typeString) {
            file.iterateNodesByType(type, function (node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    addError(typeString, node);
                }
            });
        }

        var typeIndex = this._typeIndex;
        if (typeIndex['if'] || typeIndex['else']) {
            file.iterateNodesByType('IfStatement', function (node) {
                if (typeIndex.if && node.consequent && node.consequent.type !== 'BlockStatement') {
                    addError('If', node);
                }
                if (typeIndex['else'] && node.alternate &&
                    node.alternate.type !== 'BlockStatement' &&
                    node.alternate.type !== 'IfStatement'
                ) {
                    addError('Else', node);
                }
            });
        }
        if (typeIndex['case'] || typeIndex['default']) {
            file.iterateNodesByType('SwitchCase', function (node) {
                // empty case statement
                if (!node.consequent || node.consequent.length === 0) {
                    return;
                }

                if (node.consequent.length === 1 && node.consequent[0].type === 'BlockStatement') {
                    return;
                }

                if (node.test === null && typeIndex['default']) {
                    addError('Default', node);
                }

                if (node.test !== null && typeIndex['case']) {
                    addError('Case', node);
                }
            });
        }
        if (typeIndex['while']) {
            checkBody('WhileStatement', 'While');
        }
        if (typeIndex['for']) {
            checkBody('ForStatement', 'For');
            checkBody('ForInStatement', 'For in');
        }
        if (typeIndex['do']) {
            checkBody('DoWhileStatement', 'Do while');
        }
    }

};

},{"assert":62}],35:[function(require,module,exports){
var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireDotNotation) {
        assert(
            typeof requireDotNotation === 'boolean',
            'requireDotNotation option requires boolean value'
        );
        assert(
            requireDotNotation === true,
            'requireDotNotation option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireDotNotation';
    },

    check: function(file, errors) {
        file.iterateNodesByType('MemberExpression', function(node) {
            if (!node.computed || node.property.type !== 'Literal') {
                return;
            }

            var value = node.property.value;
            if (typeof value === 'number' || (typeof value === 'string' && !utils.isValidIdentifierName(value))) {
                return;
            }

            if (value === null ||
                typeof value === 'boolean' ||
                value === 'null' ||
                value === 'true' ||
                value === 'false' ||
                utils.isEs3Keyword(value) ||
                utils.isEs3FutureReservedWord(value)
            ) {
                return;
            }

            errors.add(
                'Use dot notation instead of brackets for member expressions',
                node.property.loc.start
            );
        });
    }

};

},{"../utils":60,"assert":62}],36:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireKeywordsOnNewLine';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line === token.loc.start.line) {
                    errors.add(
                        'Keyword `' + token.value + '` should be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};

},{"assert":62}],37:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireLeftStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireLeftStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.range[1] !== token.range[0]) {
                    errors.add(
                        'Operator ' + token.value + ' should stick to preceding expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],38:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireLineFeedAtFileEnd) {
        assert(
            typeof requireLineFeedAtFileEnd === 'boolean',
            'requireLineFeedAtFileEnd option requires boolean value'
        );
        assert(
            requireLineFeedAtFileEnd === true,
            'requireLineFeedAtFileEnd option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireLineFeedAtFileEnd';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines[lines.length - 1] !== '') {
            errors.add('Missing line feed at file end', lines.length, 0);
        }
    }

};

},{"assert":62}],39:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMultipleVarDecl) {
        assert(
            typeof requireMultipleVarDecl === 'boolean',
            'requireMultipleVarDecl option requires boolean value'
        );
        assert(
            requireMultipleVarDecl === true,
            'requireMultipleVarDecl option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            var pos = node.parentCollection.indexOf(node);
            if (pos < node.parentCollection.length - 1) {
                var sibling = node.parentCollection[pos + 1];
                if (sibling.type === 'VariableDeclaration') {
                    errors.add(
                        'Var declarations should be joined',
                        sibling.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],40:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireOperatorBeforeLineBreak option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireOperatorBeforeLineBreak';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Operator ' + token.value + ' should not be on a new line',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],41:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireParenthesesAroundIIFE) {
        assert(
            typeof requireParenthesesAroundIIFE === 'boolean',
            'requireParenthesesAroundIIFE option requires boolean value'
        );
        assert(
            requireParenthesesAroundIIFE === true,
            'requireParenthesesAroundIIFE option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireParenthesesAroundIIFE';
    },

    check: function(file, errors) {

        function isWrapped(node) {
            var tokens = file.getTokens();
            var openingToken = file.getTokenPosByRangeStart(node.range[0]);
            var closingToken = file.getTokenPosByRangeStart(node.range[1] - 1);

            return tokens[openingToken - 1].value + tokens[closingToken + 1].value === '()';
        }

        file.iterateNodesByType('CallExpression', function (node) {
            var callee = node.callee;
            var outer = node;
            var inner;

            if (callee.type === 'MemberExpression' &&
                callee.object.type === 'FunctionExpression' &&
                callee.property.type === 'Identifier' &&
                (callee.property.name === 'call' || callee.property.name === 'apply')
            ) {
                inner = callee.object;
            } else if (callee.type === 'FunctionExpression') {
                inner = callee;
            } else {
                return;
            }

            if (!isWrapped(inner) && !isWrapped(outer)) {
                errors.add(
                    'Wrap immediately invoked function expressions in parentheses',
                    node.loc.start.line,
                    node.loc.start.column
                );

            }
        });
    }

};

},{"assert":62}],42:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireRightStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireRightStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] !== token.range[1]) {
                    errors.add(
                        'Operator ' + token.value + ' should stick to following expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],43:[function(require,module,exports){
var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireSpaceAfterBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function (node) {
            if (operators[node.operator]) {
                // get token before right part of expression
                var tokenBeforeRightPart = tokenHelper.getTokenByRangeStart(file, node.right.range[0] - 1, true);

                if (tokenHelper.tokenIsPunctuator(tokenBeforeRightPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should not stick to following expression',
                        tokenBeforeRightPart.loc.start
                    );
                }
            }
        });
    }

};

},{"../token-helper":58,"assert":62}],44:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        file.iterateTokensByType('Keyword', function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            'Missing space after `' + token.value + '` keyword',
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            }
        });
    }

};

},{"assert":62}],45:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceAfterObjectKeys) {
        assert(
            typeof requireSpaceAfterObjectKeys === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            requireSpaceAfterObjectKeys === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var key = property.key;
                var keyPos = file.getTokenPosByRangeStart(key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.range[0] === key.range[1]) {
                    errors.add('Missing space after key', key.loc.end);
                }
            });
        });
    }

};

},{"assert":62}],46:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function (node) {
            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operatorIndex[node.operator]) {
                var operatorTokenIndex = file.getTokenPosByRangeStart(node.range[0]);
                var operatorToken = tokens[operatorTokenIndex];
                var nextToken = tokens[operatorTokenIndex + 1];
                if (operatorToken.range[1] === nextToken.range[0]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};

},{"assert":62}],47:[function(require,module,exports){
var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireSpaceBeforeBinaryOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        // 2 + 2, 2 == 2
        file.iterateNodesByType(['BinaryExpression'], function (node) {
            if (operators[node.operator]) {
                // get token after left part of expression
                var tokenAfterLeftPart = tokenHelper.getTokenByRangeStart(file, node.left.range[1]);

                if (tokenHelper.tokenIsPunctuator(tokenAfterLeftPart, node.operator)) {
                    errors.add(
                        'Operator ' + node.operator + ' should not stick to preceding expression',
                        tokenAfterLeftPart.loc.start
                    );
                }
            }
        });
    }

};

},{"../token-helper":58,"assert":62}],48:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), this.getOptionName() + ' option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function () {
        return 'requireSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function (node) {
            // "!node.prefix" means postfix type of (inc|dec)rement
            if (!node.prefix && operatorIndex[node.operator]) {
                var operatorStartPos = node.range[1] - node.operator.length;
                var operatorTokenIndex = file.getTokenPosByRangeStart(operatorStartPos);
                var operatorToken = tokens[operatorTokenIndex];
                var prevToken = tokens[operatorTokenIndex - 1];
                if (operatorToken.range[0] === prevToken.range[1]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};

},{"assert":62}],49:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'requireSpacesInFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'requireSpacesInFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'requireSpacesInFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'requireSpacesInFunctionExpression must have beforeOpeningCurlyBrace or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function () {
        return 'requireSpacesInFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType([ 'FunctionDeclaration', 'FunctionExpression' ], function (node) {

            if (beforeOpeningRoundBrace) {
                var nodeBeforeRoundBrace = node;
                // named function
                if (node.id) {
                    nodeBeforeRoundBrace = node.id;
                }

                var functionTokenPos = file.getTokenPosByRangeStart(nodeBeforeRoundBrace.range[0]);
                var functionToken = tokens[functionTokenPos];

                var nextTokenPos = file.getTokenPosByRangeStart(functionToken.range[1]);
                var nextToken = tokens[nextTokenPos];

                if (nextToken) {
                    errors.add(
                        'Missing space before opening round brace',
                        nextToken.loc.start
                    );
                }
            }

            if (beforeOpeningCurlyBrace) {
                var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.body.range[0] - 1);
                var tokenBeforeBody = tokens[tokenBeforeBodyPos];

                if (tokenBeforeBody) {
                    errors.add(
                        'Missing space before opening curly brace',
                        tokenBeforeBody.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":62}],50:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'allButNested': true
        };
        assert(
            typeof mode === 'string' &&
            modes[mode],
            'requireSpacesInsideArrayBrackets option requires string value \'all\' or \'allButNested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ArrayExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (nextToken.type === 'Punctuator' && nextToken.value === ']') {
                return;
            }

            if (mode === 'allButNested' && nextToken.type === 'Punctuator' && nextToken.value === '[') {
                return;
            }

            if (openingBracket.range[1] === nextToken.range[0]) {
                errors.add('Missing space after opening square bracket', nextToken.loc.start);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.range[0] === prevToken.range[1]) {
                if (!(mode === 'allButNested' &&
                    prevToken.type === 'Punctuator' &&
                    prevToken.value === ']'
                )) {
                    errors.add('Missing space before closing square bracket', closingBracket.loc.start);
                }
            }
        });
    }

};

},{"assert":62}],51:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'allButNested': true
        };
        assert(
            typeof mode === 'string' &&
            modes[mode],
            'requireSpacesInsideObjectBrackets option requires string value \'all\' or \'allButNested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireSpacesInsideObjectBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                return;
            }

            if (openingBracket.range[1] === nextToken.range[0]) {
                errors.add('Missing space after opening curly brace', nextToken.loc.start);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];
            var isNested = mode === 'allButNested' &&
                           prevToken.type === 'Punctuator' &&
                           prevToken.value === '}';

            if (closingBracket.range[0] === prevToken.range[1]) {
                if (!isNested) {
                    errors.add('Missing space before closing curly brace', closingBracket.loc.start);
                }
            } else if (isNested && closingBracket.loc.start.line === prevToken.loc.start.line) {
                errors.add('Illegal space between closing curly braces', prevToken.loc.end);
            }
        });
    }

};

},{"assert":62}],52:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keyword) {
        assert(typeof keyword === 'string', 'safeContextKeyword option requires string value');

        this._keyword = keyword;
    },

    getOptionName: function () {
        return 'safeContextKeyword';
    },

    check: function(file, errors) {
        var keyword = this._keyword;

        // var that = this
        file.iterateNodesByType('VariableDeclaration', function (node) {

            for (var i = 0; i < node.declarations.length; i++) {
                var decl = node.declarations[i];

                if (
                    // decl.init === null in case of "var foo;"
                    decl.init &&
                    (decl.init.type === 'ThisExpression' && decl.id.name !== keyword)
                ) {
                    errors.add(
                        'You should use "' + keyword + '" to safe "this"',
                        node.loc.start
                    );
                }
            }
        });

        // that = this
        file.iterateNodesByType('AssignmentExpression', function (node) {

            if (
                // filter property assignments "foo.bar = this"
                node.left.type === 'Identifier' &&
                (node.right.type === 'ThisExpression' && node.left.name !== keyword)
            ) {
                errors.add(
                    'You should use "' + keyword + '" to safe "this"',
                    node.loc.start
                );
            }
        });
    }

};

},{"assert":62}],53:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(validateIndentation) {
        assert(
            validateIndentation === '\t' ||
                (typeof validateIndentation === 'number' && validateIndentation > 0),
            'validateIndentation option requires a positive number of spaces or "\\t"'
        );

        if (typeof validateIndentation === 'number') {
            this._indentChar = ' ';
            this._indentSize = validateIndentation;
        } else {
            this._indentChar = '\t';
            this._indentSize = 1;
        }

        this._indentableNodes = {
            BlockStatement: 'body',
            ObjectExpression: 'properties',
            ArrayExpression: 'elements',
            SwitchStatement: 'cases'
        };
    },

    getOptionName: function () {
        return 'validateIndentation';
    },

    check: function(file, errors) {
        function getLinesWithCommentsRemoved() {
            var lines = file.getLines().concat();
            file.getComments().reverse().forEach(function(comment) {
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
                    lines[x] = lines[x].substring(endCol + 1);

                    if (lines[x] !== '') {
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

        function isMultiline(node) {
            return node.loc.start.line !== node.loc.end.line;
        }

        function getIndentableParent(node) {
            var parent = node.parentNode;

            if (parent.type === 'Property' && parent.parentNode.type === 'ObjectExpression') {
                return parent.parentNode;
            }

            return parent;
        }

        function isSameLineAsIndentableParent(node) {
            var parent = getIndentableParent(node);

            return indentableNodes[parent.type] &&
                node.loc.start.line === parent.loc.start.line;
        }

        function getIndent(i) {
            return new Array(getIndentationLength(i) + 1).join(indentChar);
        }

        function getIndentationLength(i) {
            return indentSize * lineIndentation[i];
        }

        function markLinesToCheck(node, childrenProperty) {
            var children = node[childrenProperty];

            children.forEach(function(childNode) {
                linesToCheck[childNode.loc.start.line - 1] = true;
            });

            linesToCheck[node.loc.start.line - 1] = true;
            linesToCheck[node.loc.end.line - 1] = true;
        }

        function checkIndentation(i) {
            var line = lines[i];
            var indentLength = getIndentationLength(i);

            if (line === '' || !linesToCheck[i]) {
                return;
            }

            if (line.length < indentLength ||
                line.indexOf(getIndent(i)) !== 0 ||
                line[indentLength] === indentChar
            ) {
                errors.add(
                    'Expected indentation of ' + indentLength + ' characters',
                    i + 1,
                    indentLength
                );
            }
        }

        function checkIndentations() {
            lineIndentation.forEach(function(line, i) {
                checkIndentation(i);
            });
        }

        function generateIndentations() {
            file.iterateNodesByType([
                'BlockStatement',
                'ObjectExpression',
                'ArrayExpression'
            ], function (node) {
                if (!isMultiline(node)) {
                    return;
                }

                var childrenProperty = indentableNodes[node.type];
                markLinesToCheck(node, childrenProperty);

                if (!isSameLineAsIndentableParent(node)) {
                    for (var x = node.loc.start.line + 1; x < node.loc.end.line; x++) {
                        lineIndentation[x - 1]++;
                    }
                }
            });

            file.iterateNodesByType('SwitchStatement', function (node) {
                if (!isMultiline(node)) {
                    return;
                }

                var childrenProperty = indentableNodes[node.type];
                markLinesToCheck(node, childrenProperty);

                var children = node[childrenProperty];

                // allow switch statements to have cases that are
                // indented 0 or 1 times depending on the indentation of the first case
                if (!isSameLineAsIndentableParent(node) &&
                    children.length > 0 &&
                    node.loc.start.column !== children[0].loc.start.column
                ) {
                    for (var x = node.loc.start.line + 1; x < node.loc.end.line; x++) {
                        lineIndentation[x - 1]++;
                    }
                }
            });

            file.iterateNodesByType('SwitchCase', function (node) {
                if (!isMultiline(node)) {
                    return;
                }

                markLinesToCheck(node, 'consequent');

                var children = node.consequent;

                // don't double indent cases with
                // only a block statement as their consequent
                if (!isSameLineAsIndentableParent(node) && children.length &&
                    (children.length > 1 || children[0].type !== 'BlockStatement')
                ) {
                    for (var x = node.loc.start.line + 1; x <= node.loc.end.line; x++) {
                        lineIndentation[x - 1]++;
                    }
                }
            });
        }

        var indentableNodes = this._indentableNodes;
        var indentChar = this._indentChar;
        var indentSize = this._indentSize;

        var lines = getLinesWithCommentsRemoved();
        var lineIndentation = lines.map(function() {
            return 0;
        });
        var linesToCheck = lines.map(function() {
            return false;
        });

        generateIndentations();
        checkIndentations();
    }

};

},{"assert":62}],54:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(typeof options === 'object', 'validateJSDoc option requires object value');
        this._options = options;
    },

    getOptionName: function () {
        return 'validateJSDoc';
    },

    check: function(file, errors) {
        var options = this._options;
        var comments = file.getComments();
        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var jsDoc = getJsDocForLine(node.loc.start.line);
            if (jsDoc) {
                var jsDocData = jsDoc.value;
                var jsDocLines = jsDocData.split('\n');
                var paramIndex = 0;
                if (options.checkParamNames || options.checkRedundantParams || options.requireParamTypes) {
                    for (var i = 0, l = jsDocLines.length; i < l; i++) {
                        var line = jsDocLines[i].trim();
                        if (line.charAt(0) === '*') {
                            line = line.substr(1).trim();
                            if (line.indexOf('@param') === 0) {
                                var match = line.match(/^@param\s+(?:{(.+?)})?\s*(?:\[)?([a-zA-Z0-9_\.\$]+)/);
                                if (match) {
                                    var jsDocParamType = match[1];
                                    var jsDocParamName = match[2];
                                    if (options.requireParamTypes && !jsDocParamType) {
                                        errors.add(
                                            'Missing JSDoc @param type',
                                            jsDoc.loc.start.line + i,
                                            jsDocLines[i].indexOf('@param')
                                        );
                                    }
                                    if (jsDocParamName.indexOf('.') === -1) {
                                        var param = node.params[paramIndex];
                                        if (param) {
                                            if (jsDocParamName !== param.name) {
                                                if (options.checkParamNames) {
                                                    errors.add(
                                                        'Invalid JSDoc @param argument name',
                                                        jsDoc.loc.start.line + i,
                                                        jsDocLines[i].indexOf('@param')
                                                    );
                                                }
                                            }
                                        } else {
                                            if (options.checkRedundantParams) {
                                                errors.add(
                                                    'Redundant JSDoc @param',
                                                    jsDoc.loc.start.line + i,
                                                    jsDocLines[i].indexOf('@param')
                                                );
                                            }
                                        }
                                        paramIndex++;
                                    }
                                } else {
                                    errors.add(
                                        'Invalid JSDoc @param',
                                        jsDoc.loc.start.line + i,
                                        jsDocLines[i].indexOf('@param')
                                    );
                                }
                            }
                        }
                    }
                }
            }
        });

        function getJsDocForLine(line) {
            line--;
            for (var i = 0, l = comments.length; i < l; i++) {
                var comment = comments[i];
                if (comment.loc.end.line === line && comment.type === 'Block' && comment.value.charAt(0) === '*') {
                    return comment;
                }
            }
            return null;
        }
    }

};

},{"assert":62}],55:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            typeof options === 'string' || typeof options === 'object',
            'validateLineBreaks option requires string or object value'
        );

        if (typeof options === 'string') {
            options = { character: options };
        }

        var lineBreaks = {
            CR: '\r',
            LF: '\n',
            CRLF: '\r\n'
        };
        this._allowedLineBreak = lineBreaks[options.character];

        this._reportOncePerFile = options.reportOncePerFile !== false;
    },

    getOptionName: function () {
        return 'validateLineBreaks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines.length < 2) {
            return;
        }

        var lineBreaks = file.getSource().match(/\r\n|\r|\n/g);
        for (var i = 0, len = lineBreaks.length; i < len; i++) {
            if (lineBreaks[i] !== this._allowedLineBreak) {
                errors.add('Invalid line break', i + 1, lines[i].length);
                if (this._reportOncePerFile) {
                    break;
                }
            }
        }
    }

};

},{"assert":62}],56:[function(require,module,exports){
var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(allowedQuoteMark) {
        assert(
            allowedQuoteMark === '"' || allowedQuoteMark === '\'' || allowedQuoteMark === true,
            'validateQuoteMarks option requires \'"\', "\'", or boolean true'
        );

        this._allowedQuoteMark = allowedQuoteMark;
    },

    getOptionName: function () {
        return 'validateQuoteMarks';
    },

    check: function(file, errors) {
        var allowedQuoteMark = this._allowedQuoteMark;

        file.iterateTokensByType('String', function(token) {
            if (allowedQuoteMark === true) {
                allowedQuoteMark = token.value[0];
            }

            if (token.value[0] !== allowedQuoteMark) {
                errors.add(
                    'Invalid quote mark found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};

},{"assert":62}],57:[function(require,module,exports){
var esprima = require('esprima');
var Errors = require('./errors');
var JsFile = require('./js-file');
var presets = {
    jquery: require('./presets/jquery.json')
};

/**
 * Starts Code Style checking process.
 *
 * @name StringChecker
 */
var StringChecker = function() {
    this._rules = [];
    this._activeRules = [];
    this._config = {};
};

StringChecker.prototype = {
    /**
     * Registers single Code Style checking rule.
     *
     * @param {Rule} rule
     */
    registerRule: function(rule) {
        this._rules.push(rule);
    },

    /**
     * Registers built-in Code Style cheking rules.
     */
    registerDefaultRules: function() {
        this.registerRule(new (require('./rules/require-curly-braces'))());
        this.registerRule(new (require('./rules/require-multiple-var-decl'))());
        this.registerRule(new (require('./rules/disallow-multiple-var-decl'))());
        this.registerRule(new (require('./rules/disallow-empty-blocks'))());
        this.registerRule(new (require('./rules/require-space-after-keywords'))());
        this.registerRule(new (require('./rules/disallow-space-after-keywords'))());
        this.registerRule(new (require('./rules/require-parentheses-around-iife'))());

        /* deprecated rules */
        this.registerRule(new (require('./rules/require-left-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-left-sticked-operators'))());
        this.registerRule(new (require('./rules/require-right-sticked-operators'))());
        this.registerRule(new (require('./rules/disallow-right-sticked-operators'))());
        /* deprecated rules (end) */

        this.registerRule(new (require('./rules/require-operator-before-line-break'))());
        this.registerRule(new (require('./rules/disallow-implicit-type-conversion'))());
        this.registerRule(new (require('./rules/require-camelcase-or-uppercase-identifiers'))());
        this.registerRule(new (require('./rules/disallow-keywords'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-breaks'))());
        this.registerRule(new (require('./rules/disallow-multiple-line-strings'))());
        this.registerRule(new (require('./rules/validate-line-breaks'))());
        this.registerRule(new (require('./rules/validate-quote-marks'))());
        this.registerRule(new (require('./rules/validate-indentation'))());
        this.registerRule(new (require('./rules/disallow-trailing-whitespace'))());
        this.registerRule(new (require('./rules/disallow-mixed-spaces-and-tabs'))());
        this.registerRule(new (require('./rules/require-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/disallow-keywords-on-new-line'))());
        this.registerRule(new (require('./rules/require-line-feed-at-file-end'))());
        this.registerRule(new (require('./rules/maximum-line-length'))());
        this.registerRule(new (require('./rules/validate-jsdoc'))());
        this.registerRule(new (require('./rules/disallow-yoda-conditions'))());
        this.registerRule(new (require('./rules/require-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/require-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-object-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-array-brackets'))());
        this.registerRule(new (require('./rules/disallow-spaces-inside-parentheses'))());
        this.registerRule(new (require('./rules/require-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-space-after-object-keys'))());
        this.registerRule(new (require('./rules/disallow-quoted-keys-in-objects'))());
        this.registerRule(new (require('./rules/disallow-dangling-underscores'))());
        this.registerRule(new (require('./rules/require-aligned-object-values'))());

        this.registerRule(new (require('./rules/disallow-comma-before-line-break'))());
        this.registerRule(new (require('./rules/require-comma-before-line-break'))());

        this.registerRule(new (require('./rules/disallow-space-before-postfix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-before-postfix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-after-prefix-unary-operators.js'))());
        this.registerRule(new (require('./rules/require-space-after-prefix-unary-operators.js'))());

        this.registerRule(new (require('./rules/disallow-space-before-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-before-binary-operators'))());

        this.registerRule(new (require('./rules/disallow-space-after-binary-operators'))());
        this.registerRule(new (require('./rules/require-space-after-binary-operators'))());

        this.registerRule(new (require('./rules/require-spaces-in-function-expression'))());
        this.registerRule(new (require('./rules/disallow-spaces-in-function-expression'))());

        this.registerRule(new (require('./rules/require-capitalized-constructors'))());

        this.registerRule(new (require('./rules/safe-context-keyword'))());

        this.registerRule(new (require('./rules/require-dot-notation'))());
    },

    /**
     * Get processed config
     * @return {Object}
     */
    getProcessedConfig: function() {
        return this._config;
    },

    /**
     * Loads configuration from JS Object. Activates and configures required rules.
     *
     * @param {Object} config
     */
    configure: function(config) {
        this.throwNonCamelCaseErrorIfNeeded(config);
        this.setPreset(config);

        var configRules = Object.keys(config);
        var activeRules = this._activeRules;

        this._config = config;
        this._rules.forEach(function(rule) {
            var ruleOptionName = rule.getOptionName();
            if (config.hasOwnProperty(ruleOptionName)) {
                rule.configure(config[ruleOptionName]);
                activeRules.push(rule);
                configRules.splice(configRules.indexOf(ruleOptionName), 1);
            }
        });
        if (configRules.length > 0) {
            throw new Error('Unsupported rules: ' + configRules.join(', '));
        }
    },

    /**
     * Throws error for non camel-case options.
     *
     * @param {Object} config
     */
    throwNonCamelCaseErrorIfNeeded: function(config) {
        function symbolToUpperCase(s, symbol) {
            return symbol.toUpperCase();
        }
        function fixConfig(originConfig) {
            var result = {};
            for (var i in originConfig) {
                if (originConfig.hasOwnProperty(i)) {
                    var camelCaseName = i.replace(/_([a-zA-Z])/g, symbolToUpperCase);
                    var value = originConfig[i];
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        value = fixConfig(value);
                    }
                    result[camelCaseName] = value;
                }
            }
            return result;
        }
        var hasOldStyleConfigParams = false;
        for (var i in config) {
            if (config.hasOwnProperty(i)) {
                if (i.indexOf('_') !== -1) {
                    hasOldStyleConfigParams = true;
                    break;
                }
            }
        }
        if (hasOldStyleConfigParams) {
            throw new Error('JSCS now accepts configuration options in camel case. Sorry for inconvenience. ' +
                'On the bright side, we tried to convert your jscs config to camel case.\n' +
                '----------------------------------------\n' +
                JSON.stringify(fixConfig(config), null, 4) +
                '\n----------------------------------------\n');
        }
    },

    /**
     * Take preset (if defined) rules and extend passed config with them
     *
     * @param {Object} config
     */
    setPreset: function(config) {
        if (!config.preset) {
            return;
        }

        var preset = presets[config.preset];

        delete config.preset;
        for (var rule in preset) {
            if (!(rule in config)) {
                config[rule] = preset[rule];
            }
        }
    },

    /**
     * Checks file provided with a string.
     * @param {String} str
     * @param {String} filename
     * @returns {Errors}
     */
    checkString: function(str, filename) {
        filename = filename || 'input';
        var tree;
        str = str.replace(/^#![^\n]+\n/, '\n');
        try {
            tree = esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
        } catch (e) {
            throw new Error('Syntax error at ' + filename + ': ' + e.message);
        }
        var file = new JsFile(filename, str, tree);
        var errors = new Errors(file);
        this._activeRules.forEach(function(rule) {
            rule.check(file, errors);
        });
        return errors;
    }
};

module.exports = StringChecker;

},{"./errors":1,"./js-file":2,"./presets/jquery.json":3,"./rules/disallow-comma-before-line-break":4,"./rules/disallow-dangling-underscores":5,"./rules/disallow-empty-blocks":6,"./rules/disallow-implicit-type-conversion":7,"./rules/disallow-keywords":9,"./rules/disallow-keywords-on-new-line":8,"./rules/disallow-left-sticked-operators":10,"./rules/disallow-mixed-spaces-and-tabs":11,"./rules/disallow-multiple-line-breaks":12,"./rules/disallow-multiple-line-strings":13,"./rules/disallow-multiple-var-decl":14,"./rules/disallow-quoted-keys-in-objects":15,"./rules/disallow-right-sticked-operators":16,"./rules/disallow-space-after-binary-operators":17,"./rules/disallow-space-after-keywords":18,"./rules/disallow-space-after-object-keys":19,"./rules/disallow-space-after-prefix-unary-operators.js":20,"./rules/disallow-space-before-binary-operators":21,"./rules/disallow-space-before-postfix-unary-operators.js":22,"./rules/disallow-spaces-in-function-expression":23,"./rules/disallow-spaces-inside-array-brackets":24,"./rules/disallow-spaces-inside-object-brackets":25,"./rules/disallow-spaces-inside-parentheses":26,"./rules/disallow-trailing-whitespace":27,"./rules/disallow-yoda-conditions":28,"./rules/maximum-line-length":29,"./rules/require-aligned-object-values":30,"./rules/require-camelcase-or-uppercase-identifiers":31,"./rules/require-capitalized-constructors":32,"./rules/require-comma-before-line-break":33,"./rules/require-curly-braces":34,"./rules/require-dot-notation":35,"./rules/require-keywords-on-new-line":36,"./rules/require-left-sticked-operators":37,"./rules/require-line-feed-at-file-end":38,"./rules/require-multiple-var-decl":39,"./rules/require-operator-before-line-break":40,"./rules/require-parentheses-around-iife":41,"./rules/require-right-sticked-operators":42,"./rules/require-space-after-binary-operators":43,"./rules/require-space-after-keywords":44,"./rules/require-space-after-object-keys":45,"./rules/require-space-after-prefix-unary-operators.js":46,"./rules/require-space-before-binary-operators":47,"./rules/require-space-before-postfix-unary-operators.js":48,"./rules/require-spaces-in-function-expression":49,"./rules/require-spaces-inside-array-brackets":50,"./rules/require-spaces-inside-object-brackets":51,"./rules/safe-context-keyword":52,"./rules/validate-indentation":53,"./rules/validate-jsdoc":54,"./rules/validate-line-breaks":55,"./rules/validate-quote-marks":56,"esprima":65}],58:[function(require,module,exports){
/**
 * Returns token by range start. Ignores ()
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 * @returns {Object}
 */
module.exports.getTokenByRangeStart = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // we should check for "(" if we go backward
    var parenthesis = backward ? '(' : ')';

    // if token is ")" -> get next token
    // for example (a) + (b)
    // next token ---^
    // we should find (a) + (b)
    // ------------------^
    if (token &&
        token.type === 'Punctuator' &&
        token.value === parenthesis
    ) {
        var pos = backward ? token.range[0] - 1 : token.range[1];
        tokenPos = file.getTokenPosByRangeStart(pos);
        token = tokens[tokenPos];
    }

    return token;
};

/**
 * Returns true if token is punctuator
 *
 * @param {Object} token
 * @param {String} punctuator
 * @returns {Boolean}
 */
module.exports.tokenIsPunctuator = function(token, punctuator) {
    return token && token.type === 'Punctuator' && token.value === punctuator;
};

},{}],59:[function(require,module,exports){
module.exports = {
    iterate: iterate
};

var iterableProperties = {
    'body': true,
    'expression': true,

    // if
    'test': true,
    'consequent': true,
    'alternate': true,

    'object': true,

    //switch
    'discriminant': true,
    'cases': true,

    // return
    'argument': true,
    'arguments': true,

    // try
    'block': true,
    'guardedHandlers': true,
    'handlers': true,
    'finalizer': true,

    // catch
    'handler': true,

    // for
    'init': true,
    'update': true,

    // for in
    'left': true,
    'right': true,

    // var
    'declarations': true,

    // array
    'elements': true,

    // object
    'properties': true,
    'key': true,
    'value': true,

    // new
    'callee': true,

    // xxx.yyy
    'property': true
};

function iterate(node, cb, parentNode, parentCollection) {
    cb(node, parentNode, parentCollection);
    for (var propName in node) {
        if (node.hasOwnProperty(propName)) {
            if (iterableProperties[propName]) {
                var contents = node[propName];
                if (typeof contents === 'object') {
                    if (Array.isArray(contents)) {
                        for (var i = 0, l = contents.length; i < l; i++) {
                            iterate(contents[i], cb, node, contents);
                        }
                    } else {
                        iterate(contents, cb, node, [ contents ]);
                    }
                }
            }
        }
    }
}

},{}],60:[function(require,module,exports){
// 7.5.2 Keywords
var ES3_KEYWORDS = {
    'break': true,
    'case': true,
    'catch': true,
    'continue': true,
    'default': true,
    'delete': true,
    'do': true,
    'else': true,
    'finally': true,
    'for': true,
    'function': true,
    'if': true,
    'in': true,
    'instanceof': true,
    'new': true,
    'return': true,
    'switch': true,
    'this': true,
    'throw': true,
    'try': true,
    'typeof': true,
    'var': true,
    'void': true,
    'while': true,
    'with': true
};

// 7.5.3 Future Reserved Words
var ES3_FUTURE_RESERVED_WORDS = {
    'abstract': true,
    'boolean': true,
    'byte': true,
    'char': true,
    'class': true,
    'const': true,
    'debugger': true,
    'double': true,
    'enum': true,
    'export': true,
    'extends': true,
    'final': true,
    'float': true,
    'goto': true,
    'implements': true,
    'import': true,
    'int': true,
    'interface': true,
    'long': true,
    'native': true,
    'package': true,
    'private': true,
    'protected': true,
    'public': true,
    'short': true,
    'static': true,
    'super': true,
    'synchronized': true,
    'throws': true,
    'transient': true,
    'volatile': true
};

var IDENTIFIER_NAME_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Returns true if word is keyword in ECMAScript 3 specification.
 *
 * @param {String} word
 * @returns {Boolean}
 */
exports.isEs3Keyword = function(word) {
    return Boolean(ES3_KEYWORDS[word]);
};

/**
 * Returns true if word is future reserved word in ECMAScript 3 specification.
 *
 * @param {String} word
 * @returns {Boolean}
 */
exports.isEs3FutureReservedWord = function(word) {
    return Boolean(ES3_FUTURE_RESERVED_WORDS[word]);
};

/**
 * Returns true if name is valid identifier name.
 *
 * @param {String} name
 * @returns {Boolean}
 */
exports.isValidIdentifierName = function(name) {
    return IDENTIFIER_NAME_RE.test(name);
};

},{}],61:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],62:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":61,"util":63}],63:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":61}],64:[function(require,module,exports){
/*
colors.js

Copyright (c) 2010

Marak Squires
Alexis Sellier (cloudhead)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var isHeadless = false;

if (typeof module !== 'undefined') {
  isHeadless = true;
}

if (!isHeadless) {
  var exports = {};
  var module = {};
  var colors = exports;
  exports.mode = "browser";
} else {
  exports.mode = "console";
}

//
// Prototypes the string object to have additional method calls that add terminal colors
//
var addProperty = function (color, func) {
  var allowOverride = ['bold'];
  exports[color] = function(str) {
    return func.apply(str);
  };
  String.prototype.__defineGetter__(color, func);
}

//
// Iterate through all default styles and colors
//

var x = ['bold', 'underline', 'italic', 'inverse', 'grey', 'black', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
x.forEach(function (style) {

  // __defineGetter__ at the least works in more browsers
  // http://robertnyman.com/javascript/javascript-getters-setters.html
  // Object.defineProperty only works in Chrome
  addProperty(style, function () {
    return stylize(this, style);
  });
});

function sequencer(map) {
  return function () {
    if (!isHeadless) {
      return this.replace(/( )/, '$1');
    }
    var exploded = this.split("");
    var i = 0;
    exploded = exploded.map(map);
    return exploded.join("");
  }
}

var rainbowMap = (function () {
  var rainbowColors = ['red','yellow','green','blue','magenta']; //RoY G BiV
  return function (letter, i, exploded) {
    if (letter == " ") {
      return letter;
    } else {
      return stylize(letter, rainbowColors[i++ % rainbowColors.length]);
    }
  }
})();

exports.addSequencer = function (name, map) {
  addProperty(name, sequencer(map));
}

exports.addSequencer('rainbow', rainbowMap);
exports.addSequencer('zebra', function (letter, i, exploded) {
  return i % 2 === 0 ? letter : letter.inverse;
});

exports.setTheme = function (theme) {
  Object.keys(theme).forEach(function(prop){
    addProperty(prop, function(){
      return exports[theme[prop]](this);
    });
  });
}

function stylize(str, style) {

  if (exports.mode == 'console') {
    var styles = {
      //styles
      'bold'      : ['\033[1m',  '\033[22m'],
      'italic'    : ['\033[3m',  '\033[23m'],
      'underline' : ['\033[4m',  '\033[24m'],
      'inverse'   : ['\033[7m',  '\033[27m'],
      //grayscale
      'white'     : ['\033[37m', '\033[39m'],
      'grey'      : ['\033[90m', '\033[39m'],
      'black'     : ['\033[30m', '\033[39m'],
      //colors
      'blue'      : ['\033[34m', '\033[39m'],
      'cyan'      : ['\033[36m', '\033[39m'],
      'green'     : ['\033[32m', '\033[39m'],
      'magenta'   : ['\033[35m', '\033[39m'],
      'red'       : ['\033[31m', '\033[39m'],
      'yellow'    : ['\033[33m', '\033[39m']
    };
  } else if (exports.mode == 'browser') {
    var styles = {
      //styles
      'bold'      : ['<b>',  '</b>'],
      'italic'    : ['<i>',  '</i>'],
      'underline' : ['<u>',  '</u>'],
      'inverse'   : ['<span style="background-color:black;color:white;">',  '</span>'],
      //grayscale
      'white'     : ['<span style="color:white;">',   '</span>'],
      'grey'      : ['<span style="color:grey;">',    '</span>'],
      'black'     : ['<span style="color:black;">',   '</span>'],
      //colors
      'blue'      : ['<span style="color:blue;">',    '</span>'],
      'cyan'      : ['<span style="color:cyan;">',    '</span>'],
      'green'     : ['<span style="color:green;">',   '</span>'],
      'magenta'   : ['<span style="color:magenta;">', '</span>'],
      'red'       : ['<span style="color:red;">',     '</span>'],
      'yellow'    : ['<span style="color:yellow;">',  '</span>']
    };
  } else if (exports.mode == 'none') {
    return str;
  } else {
    console.log('unsupported mode, try "browser", "console" or "none"');
  }
  return styles[style][0] + str + styles[style][1];
};

// don't summon zalgo
addProperty('zalgo', function () {
  return zalgo(this);
});

// please no
function zalgo(text, options) {
  var soul = {
    "up" : [
      '̍','̎','̄','̅',
      '̿','̑','̆','̐',
      '͒','͗','͑','̇',
      '̈','̊','͂','̓',
      '̈','͊','͋','͌',
      '̃','̂','̌','͐',
      '̀','́','̋','̏',
      '̒','̓','̔','̽',
      '̉','ͣ','ͤ','ͥ',
      'ͦ','ͧ','ͨ','ͩ',
      'ͪ','ͫ','ͬ','ͭ',
      'ͮ','ͯ','̾','͛',
      '͆','̚'
      ],
    "down" : [
      '̖','̗','̘','̙',
      '̜','̝','̞','̟',
      '̠','̤','̥','̦',
      '̩','̪','̫','̬',
      '̭','̮','̯','̰',
      '̱','̲','̳','̹',
      '̺','̻','̼','ͅ',
      '͇','͈','͉','͍',
      '͎','͓','͔','͕',
      '͖','͙','͚','̣'
      ],
    "mid" : [
      '̕','̛','̀','́',
      '͘','̡','̢','̧',
      '̨','̴','̵','̶',
      '͜','͝','͞',
      '͟','͠','͢','̸',
      '̷','͡',' ҉'
      ]
  },
  all = [].concat(soul.up, soul.down, soul.mid),
  zalgo = {};

  function randomNumber(range) {
    r = Math.floor(Math.random()*range);
    return r;
  };

  function is_char(character) {
    var bool = false;
    all.filter(function(i){
     bool = (i == character);
    });
    return bool;
  }

  function heComes(text, options){
      result = '';
      options = options || {};
      options["up"] = options["up"] || true;
      options["mid"] = options["mid"] || true;
      options["down"] = options["down"] || true;
      options["size"] = options["size"] || "maxi";
      var counts;
      text = text.split('');
       for(var l in text){
         if(is_char(l)) { continue; }
         result = result + text[l];

        counts = {"up" : 0, "down" : 0, "mid" : 0};

        switch(options.size) {
          case 'mini':
            counts.up = randomNumber(8);
            counts.min= randomNumber(2);
            counts.down = randomNumber(8);
          break;
          case 'maxi':
            counts.up = randomNumber(16) + 3;
            counts.min = randomNumber(4) + 1;
            counts.down = randomNumber(64) + 3;
          break;
          default:
            counts.up = randomNumber(8) + 1;
            counts.mid = randomNumber(6) / 2;
            counts.down= randomNumber(8) + 1;
          break;
        }

        var arr = ["up", "mid", "down"];
        for(var d in arr){
          var index = arr[d];
          for (var i = 0 ; i <= counts[index]; i++)
          {
            if(options[index]) {
                result = result + soul[index][randomNumber(soul[index].length)];
              }
            }
          }
        }
      return result;
  };
  return heComes(text);
}

addProperty('stripColors', function() {
  return ("" + this).replace(/\u001b\[\d+m/g,'');
});

},{}],65:[function(require,module,exports){
/*
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true plusplus:true */
/*global esprima:true, define:true, exports:true, window: true,
throwError: true, createLiteral: true, generateStatement: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseStatement: true, parseSourceElement: true */

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        length,
        buffer,
        state,
        extra;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnexpectedNumber:  'Unexpected number',
        UnexpectedString:  'Unexpected string',
        UnexpectedIdentifier:  'Unexpected identifier',
        UnexpectedReserved:  'Unexpected reserved word',
        UnexpectedEOS:  'Unexpected end of input',
        NewlineAfterThrow:  'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp:  'Invalid regular expression: missing /',
        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally:  'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith:  'Strict mode code may not include a with statement',
        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord:  'Use of future reserved word in strict mode'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function sliceSource(from, to) {
        return source.slice(from, to);
    }

    if (typeof 'esprima'[0] === 'undefined') {
        sliceSource = function sliceArraySource(from, to) {
            return source.slice(from, to).join('');
        };
    }

    function isDecimalDigit(ch) {
        return '0123456789'.indexOf(ch) >= 0;
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
            (ch === '\u000C') || (ch === '\u00A0') ||
            (ch.charCodeAt(0) >= 0x1680 &&
             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
    }

    function isIdentifierPart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch >= '0') && (ch <= '9')) ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {

        // Future reserved words.
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        }

        return false;
    }

    function isStrictModeReservedWord(id) {
        switch (id) {

        // Strict Mode reserved words.
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        }

        return false;
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        var keyword = false;
        switch (id.length) {
        case 2:
            keyword = (id === 'if') || (id === 'in') || (id === 'do');
            break;
        case 3:
            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
            break;
        case 4:
            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
            break;
        case 5:
            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
            break;
        case 6:
            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
            break;
        case 7:
            keyword = (id === 'default') || (id === 'finally');
            break;
        case 8:
            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
            break;
        case 10:
            keyword = (id === 'instanceof');
            break;
        }

        if (keyword) {
            return true;
        }

        switch (id) {
        // Future reserved words.
        // 'const' is specialized as Keyword in V8.
        case 'const':
            return true;

        // For compatiblity to SpiderMonkey and ES.next
        case 'yield':
        case 'let':
            return true;
        }

        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        return isFutureReservedWord(id);
    }

    // 7.4 Comments

    function skipComment() {
        var ch, blockComment, lineComment;

        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                    lineComment = false;
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source[index++];
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            ++index;
                            blockComment = false;
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    index += 2;
                    lineComment = true;
                } else if (ch === '*') {
                    index += 2;
                    blockComment = true;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function scanIdentifier() {
        var ch, start, id, restore;

        ch = source[index];
        if (!isIdentifierStart(ch)) {
            return;
        }

        start = index;
        if (ch === '\\') {
            ++index;
            if (source[index] !== 'u') {
                return;
            }
            ++index;
            restore = index;
            ch = scanHexEscape('u');
            if (ch) {
                if (ch === '\\' || !isIdentifierStart(ch)) {
                    return;
                }
                id = ch;
            } else {
                index = restore;
                id = 'u';
            }
        } else {
            id = source[index++];
        }

        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }
            if (ch === '\\') {
                ++index;
                if (source[index] !== 'u') {
                    return;
                }
                ++index;
                restore = index;
                ch = scanHexEscape('u');
                if (ch) {
                    if (ch === '\\' || !isIdentifierPart(ch)) {
                        return;
                    }
                    id += ch;
                } else {
                    index = restore;
                    id += 'u';
                }
            } else {
                id += source[index++];
            }
        }

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            return {
                type: Token.Identifier,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (isKeyword(id)) {
            return {
                type: Token.Keyword,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.1 Null Literals

        if (id === 'null') {
            return {
                type: Token.NullLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.2 Boolean Literals

        if (id === 'true' || id === 'false') {
            return {
                type: Token.BooleanLiteral,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        return {
            type: Token.Identifier,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        // Check for most common single-character punctuators.

        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Dot (.) can also start a floating-point number, hence the need
        // to check the next character.

        ch2 = source[index + 1];
        if (ch1 === '.' && !isDecimalDigit(ch2)) {
            return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Peek more characters.

        ch3 = source[index + 2];
        ch4 = source[index + 3];

        // 4-character punctuator: >>>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // 3-character punctuators: === !== >>> <<= >>=

        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '===',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '!==',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 2-character punctuators: <= >= == != ++ -- << >> && ||
        // += -= *= %= &= |= ^= /=

        if (ch2 === '=') {
            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
            if ('+-<>&|'.indexOf(ch2) >= 0) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // The remaining 1-character punctuators.

        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
            return {
                type: Token.Punctuator,
                value: source[index++],
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
    }

    // 7.8.3 Numeric Literals

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    number += source[index++];
                    while (index < length) {
                        ch = source[index];
                        if (!isHexDigit(ch)) {
                            break;
                        }
                        number += source[index++];
                    }

                    if (number.length <= 2) {
                        // only 0x
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 16),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                } else if (isOctalDigit(ch)) {
                    number += source[index++];
                    while (index < length) {
                        ch = source[index];
                        if (!isOctalDigit(ch)) {
                            break;
                        }
                        number += source[index++];
                    }

                    if (index < length) {
                        ch = source[index];
                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    }
                    return {
                        type: Token.NumericLiteral,
                        value: parseInt(number, 8),
                        octal: true,
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (isDecimalDigit(ch)) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += source[index++];
            }
        }

        if (ch === '.') {
            number += source[index++];
            while (index < length) {
                ch = source[index];
                if (!isDecimalDigit(ch)) {
                    break;
                }
                number += source[index++];
            }
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }

            ch = source[index];
            if (isDecimalDigit(ch)) {
                number += source[index++];
                while (index < length) {
                    ch = source[index];
                    if (!isDecimalDigit(ch)) {
                        break;
                    }
                    number += source[index++];
                }
            } else {
                ch = 'character ' + ch;
                if (index >= length) {
                    ch = '<end>';
                }
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (index < length) {
            ch = source[index];
            if (isIdentifierStart(ch)) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!isLineTerminator(ch)) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch)) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanRegExp() {
        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

        buffer = null;
        skipComment();

        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        while (index < length) {
            ch = source[index++];
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = source[index++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator(ch)) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch)) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);

        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch)) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        str += '\\u';
                        for (; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }

        return {
            literal: str,
            value: value,
            range: [start, index]
        };
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advance() {
        var ch, token;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index]
            };
        }

        token = scanPunctuator();
        if (typeof token !== 'undefined') {
            return token;
        }

        ch = source[index];

        if (ch === '\'' || ch === '"') {
            return scanStringLiteral();
        }

        if (ch === '.' || isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        token = scanIdentifier();
        if (typeof token !== 'undefined') {
            return token;
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function lex() {
        var token;

        if (buffer) {
            index = buffer.range[1];
            lineNumber = buffer.lineNumber;
            lineStart = buffer.lineStart;
            token = buffer;
            buffer = null;
            return token;
        }

        buffer = null;
        return advance();
    }

    function lookahead() {
        var pos, line, start;

        if (buffer !== null) {
            return buffer;
        }

        pos = index;
        line = lineNumber;
        start = lineStart;
        buffer = advance();
        index = pos;
        lineNumber = line;
        lineStart = start;

        return buffer;
    }

    // Return true if there is a line terminator before the next token.

    function peekLineTerminator() {
        var pos, line, start, found;

        pos = index;
        line = lineNumber;
        start = lineStart;
        skipComment();
        found = lineNumber !== line;
        index = pos;
        lineNumber = line;
        lineStart = start;

        return found;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    return args[index] || '';
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        throw error;
    }

    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }


    // Throw an exception because of the token.

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }

        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }

        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }

        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        var token = lookahead();
        return token.type === Token.Punctuator && token.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        var token = lookahead();
        return token.type === Token.Keyword && token.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var token = lookahead(),
            op = token.value;

        if (token.type !== Token.Punctuator) {
            return false;
        }
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        var token, line;

        // Catch the very common case first.
        if (source[index] === ';') {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (match(';')) {
            lex();
            return;
        }

        token = lookahead();
        if (token.type !== Token.EOF && !match('}')) {
            throwUnexpected(token);
        }
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [];

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                elements.push(parseAssignmentExpression());

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        expect(']');

        return {
            type: Syntax.ArrayExpression,
            elements: elements
        };
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(param, first) {
        var previousStrict, body;

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwErrorTolerant(first, Messages.StrictParamName);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionExpression,
            id: null,
            params: param,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    function parseObjectPropertyKey() {
        var token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseObjectProperty() {
        var token, key, id, param;

        token = lookahead();

        if (token.type === Token.Identifier) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                return {
                    type: Syntax.Property,
                    key: key,
                    value: parsePropertyFunction([]),
                    kind: 'get'
                };
            } else if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead();
                if (token.type !== Token.Identifier) {
                    expect(')');
                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
                    return {
                        type: Syntax.Property,
                        key: key,
                        value: parsePropertyFunction([]),
                        kind: 'set'
                    };
                } else {
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    return {
                        type: Syntax.Property,
                        key: key,
                        value: parsePropertyFunction(param, token),
                        kind: 'set'
                    };
                }
            } else {
                expect(':');
                return {
                    type: Syntax.Property,
                    key: id,
                    value: parseAssignmentExpression(),
                    kind: 'init'
                };
            }
        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            return {
                type: Syntax.Property,
                key: key,
                value: parseAssignmentExpression(),
                kind: 'init'
            };
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, kind, map = {}, toString = String;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
            if (Object.prototype.hasOwnProperty.call(map, name)) {
                if (map[name] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[name] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[name] |= kind;
            } else {
                map[name] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return {
            type: Syntax.ObjectExpression,
            properties: properties
        };
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        expr = parseExpression();

        expect(')');

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var token = lookahead(),
            type = token.type;

        if (type === Token.Identifier) {
            return {
                type: Syntax.Identifier,
                name: lex().value
            };
        }

        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return createLiteral(lex());
        }

        if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                return {
                    type: Syntax.ThisExpression
                };
            }

            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
        }

        if (type === Token.BooleanLiteral) {
            lex();
            token.value = (token.value === 'true');
            return createLiteral(token);
        }

        if (type === Token.NullLiteral) {
            lex();
            token.value = null;
            return createLiteral(token);
        }

        if (match('[')) {
            return parseArrayInitialiser();
        }

        if (match('{')) {
            return parseObjectInitialiser();
        }

        if (match('(')) {
            return parseGroupExpression();
        }

        if (match('/') || match('/=')) {
            return createLiteral(scanRegExp());
        }

        return throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var expr;

        expectKeyword('new');

        expr = {
            type: Syntax.NewExpression,
            callee: parseLeftHandSideExpression(),
            'arguments': []
        };

        if (match('(')) {
            expr['arguments'] = parseArguments();
        }

        return expr;
    }

    function parseLeftHandSideExpressionAllowCall() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            }
        }

        return expr;
    }


    function parseLeftHandSideExpression() {
        var expr;

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr = parseLeftHandSideExpressionAllowCall(), token;

        token = lookahead();
        if (token.type !== Token.Punctuator) {
            return expr;
        }

        if ((match('++') || match('--')) && !peekLineTerminator()) {
            // 11.3.1, 11.3.2
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPostfix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: lex().value,
                argument: expr,
                prefix: false
            };
        }

        return expr;
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        token = lookahead();
        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return parsePostfixExpression();
        }

        if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = {
                type: Syntax.UpdateExpression,
                operator: token.value,
                argument: expr,
                prefix: true
            };
            return expr;
        }

        if (match('+') || match('-') || match('~') || match('!')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true
            };
            return expr;
        }

        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            expr = {
                type: Syntax.UnaryExpression,
                operator: lex().value,
                argument: parseUnaryExpression(),
                prefix: true
            };
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
            return expr;
        }

        return parsePostfixExpression();
    }

    // 11.5 Multiplicative Operators

    function parseMultiplicativeExpression() {
        var expr = parseUnaryExpression();

        while (match('*') || match('/') || match('%')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseUnaryExpression()
            };
        }

        return expr;
    }

    // 11.6 Additive Operators

    function parseAdditiveExpression() {
        var expr = parseMultiplicativeExpression();

        while (match('+') || match('-')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseMultiplicativeExpression()
            };
        }

        return expr;
    }

    // 11.7 Bitwise Shift Operators

    function parseShiftExpression() {
        var expr = parseAdditiveExpression();

        while (match('<<') || match('>>') || match('>>>')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseAdditiveExpression()
            };
        }

        return expr;
    }
    // 11.8 Relational Operators

    function parseRelationalExpression() {
        var expr, previousAllowIn;

        previousAllowIn = state.allowIn;
        state.allowIn = true;

        expr = parseShiftExpression();

        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseShiftExpression()
            };
        }

        state.allowIn = previousAllowIn;
        return expr;
    }

    // 11.9 Equality Operators

    function parseEqualityExpression() {
        var expr = parseRelationalExpression();

        while (match('==') || match('!=') || match('===') || match('!==')) {
            expr = {
                type: Syntax.BinaryExpression,
                operator: lex().value,
                left: expr,
                right: parseRelationalExpression()
            };
        }

        return expr;
    }

    // 11.10 Binary Bitwise Operators

    function parseBitwiseANDExpression() {
        var expr = parseEqualityExpression();

        while (match('&')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '&',
                left: expr,
                right: parseEqualityExpression()
            };
        }

        return expr;
    }

    function parseBitwiseXORExpression() {
        var expr = parseBitwiseANDExpression();

        while (match('^')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '^',
                left: expr,
                right: parseBitwiseANDExpression()
            };
        }

        return expr;
    }

    function parseBitwiseORExpression() {
        var expr = parseBitwiseXORExpression();

        while (match('|')) {
            lex();
            expr = {
                type: Syntax.BinaryExpression,
                operator: '|',
                left: expr,
                right: parseBitwiseXORExpression()
            };
        }

        return expr;
    }

    // 11.11 Binary Logical Operators

    function parseLogicalANDExpression() {
        var expr = parseBitwiseORExpression();

        while (match('&&')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '&&',
                left: expr,
                right: parseBitwiseORExpression()
            };
        }

        return expr;
    }

    function parseLogicalORExpression() {
        var expr = parseLogicalANDExpression();

        while (match('||')) {
            lex();
            expr = {
                type: Syntax.LogicalExpression,
                operator: '||',
                left: expr,
                right: parseLogicalANDExpression()
            };
        }

        return expr;
    }

    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent;

        expr = parseLogicalORExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');

            expr = {
                type: Syntax.ConditionalExpression,
                test: expr,
                consequent: consequent,
                alternate: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, expr;

        token = lookahead();
        expr = parseConditionalExpression();

        if (matchAssign()) {
            // LeftHandSideExpression
            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            expr = {
                type: Syntax.AssignmentExpression,
                operator: lex().value,
                left: expr,
                right: parseAssignmentExpression()
            };
        }

        return expr;
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr = parseAssignmentExpression();

        if (match(',')) {
            expr = {
                type: Syntax.SequenceExpression,
                expressions: [ expr ]
            };

            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }

        }
        return expr;
    }

    // 12.1 Block

    function parseStatementList() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseBlock() {
        var block;

        expect('{');

        block = parseStatementList();

        expect('}');

        return {
            type: Syntax.BlockStatement,
            body: block
        };
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return {
            type: Syntax.Identifier,
            name: token.value
        };
    }

    function parseVariableDeclaration(kind) {
        var id = parseVariableIdentifier(),
            init = null;

        // 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }

        if (kind === 'const') {
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return {
            type: Syntax.VariableDeclarator,
            id: id,
            init: init
        };
    }

    function parseVariableDeclarationList(kind) {
        var list = [];

        do {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        } while (index < length);

        return list;
    }

    function parseVariableStatement() {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: 'var'
        };
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return {
            type: Syntax.VariableDeclaration,
            declarations: declarations,
            kind: kind
        };
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');

        return {
            type: Syntax.EmptyStatement
        };
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 12.5 If statement

    function parseIfStatement() {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return {
            type: Syntax.IfStatement,
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement() {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return {
            type: Syntax.DoWhileStatement,
            body: body,
            test: test
        };
    }

    function parseWhileStatement() {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return {
            type: Syntax.WhileStatement,
            test: test,
            body: body
        };
    }

    function parseForVariableDeclaration() {
        var token = lex();

        return {
            type: Syntax.VariableDeclaration,
            declarations: parseVariableDeclarationList(),
            kind: token.value
        };
    }

    function parseForStatement() {
        var init, test, update, left, right, body, oldInIteration;

        init = test = update = null;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;

                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;

                if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }

                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }

            if (typeof left === 'undefined') {
                expect(';');
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        if (typeof left === 'undefined') {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        }

        return {
            type: Syntax.ForInStatement,
            left: left,
            right: right,
            body: body,
            each: false
        };
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var token, label = null;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source[index] === ';') {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return {
                type: Syntax.ContinueStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return {
            type: Syntax.ContinueStatement,
            label: label
        };
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var token, label = null;

        expectKeyword('break');

        // Optimize the most common form: 'break;'.
        if (source[index] === ';') {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return {
                type: Syntax.BreakStatement,
                label: null
            };
        }

        token = lookahead();
        if (token.type === Token.Identifier) {
            label = parseVariableIdentifier();

            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return {
            type: Syntax.BreakStatement,
            label: label
        };
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var token, argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source[index] === ' ') {
            if (isIdentifierStart(source[index + 1])) {
                argument = parseExpression();
                consumeSemicolon();
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            }
        }

        if (peekLineTerminator()) {
            return {
                type: Syntax.ReturnStatement,
                argument: null
            };
        }

        if (!match(';')) {
            token = lookahead();
            if (!match('}') && token.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return {
            type: Syntax.ReturnStatement,
            argument: argument
        };
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return {
            type: Syntax.WithStatement,
            object: object,
            body: body
        };
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test,
            consequent = [],
            statement;

        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatement();
            if (typeof statement === 'undefined') {
                break;
            }
            consequent.push(statement);
        }

        return {
            type: Syntax.SwitchCase,
            test: test,
            consequent: consequent
        };
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        if (match('}')) {
            lex();
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant
            };
        }

        cases = [];

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (index < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return {
            type: Syntax.SwitchStatement,
            discriminant: discriminant,
            cases: cases
        };
    }

    // 12.13 The throw statement

    function parseThrowStatement() {
        var argument;

        expectKeyword('throw');

        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return {
            type: Syntax.ThrowStatement,
            argument: argument
        };
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param;

        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead());
        }

        param = parseVariableIdentifier();
        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }

        expect(')');

        return {
            type: Syntax.CatchClause,
            param: param,
            body: parseBlock()
        };
    }

    function parseTryStatement() {
        var block, handlers = [], finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }

        return {
            type: Syntax.TryStatement,
            block: block,
            guardedHandlers: [],
            handlers: handlers,
            finalizer: finalizer
        };
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return {
            type: Syntax.DebuggerStatement
        };
    }

    // 12 Statements

    function parseStatement() {
        var token = lookahead(),
            expr,
            labeledBody;

        if (token.type === Token.EOF) {
            throwUnexpected(token);
        }

        if (token.type === Token.Punctuator) {
            switch (token.value) {
            case ';':
                return parseEmptyStatement();
            case '{':
                return parseBlock();
            case '(':
                return parseExpressionStatement();
            default:
                break;
            }
        }

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'break':
                return parseBreakStatement();
            case 'continue':
                return parseContinueStatement();
            case 'debugger':
                return parseDebuggerStatement();
            case 'do':
                return parseDoWhileStatement();
            case 'for':
                return parseForStatement();
            case 'function':
                return parseFunctionDeclaration();
            case 'if':
                return parseIfStatement();
            case 'return':
                return parseReturnStatement();
            case 'switch':
                return parseSwitchStatement();
            case 'throw':
                return parseThrowStatement();
            case 'try':
                return parseTryStatement();
            case 'var':
                return parseVariableStatement();
            case 'while':
                return parseWhileStatement();
            case 'with':
                return parseWithStatement();
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[expr.name] = true;
            labeledBody = parseStatement();
            delete state.labelSet[expr.name];

            return {
                type: Syntax.LabeledStatement,
                label: expr,
                body: labeledBody
            };
        }

        consumeSemicolon();

        return {
            type: Syntax.ExpressionStatement,
            expression: expr
        };
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

        expect('{');

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;

        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;

        return {
            type: Syntax.BlockStatement,
            body: sourceElements
        };
    }

    function parseFunctionDeclaration() {
        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;

        expectKeyword('function');
        token = lookahead();
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }

        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionDeclaration,
            id: id,
            params: params,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;

        expectKeyword('function');

        if (!match('(')) {
            token = lookahead();
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead();
                param = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[param.name] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return {
            type: Syntax.FunctionExpression,
            id: id,
            params: params,
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    }

    // 14 Program

    function parseSourceElement() {
        var token = lookahead();

        if (token.type === Token.Keyword) {
            switch (token.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(token.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (token.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead();
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (index < length) {
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseProgram() {
        var program;
        strict = false;
        program = {
            type: Syntax.Program,
            body: parseSourceElements()
        };
        return program;
    }

    // The following functions are needed only when the option to preserve
    // the comments is active.

    function addComment(type, value, start, end, loc) {
        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (extra.comments.length > 0) {
            if (extra.comments[extra.comments.length - 1].range[1] > start) {
                return;
            }
        }

        extra.comments.push({
            type: type,
            value: value,
            range: [start, end],
            loc: loc
        });
    }

    function scanComment() {
        var comment, ch, loc, start, blockComment, lineComment;

        comment = '';
        blockComment = false;
        lineComment = false;

        while (index < length) {
            ch = source[index];

            if (lineComment) {
                ch = source[index++];
                if (isLineTerminator(ch)) {
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    lineComment = false;
                    addComment('Line', comment, start, index - 1, loc);
                    if (ch === '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                    comment = '';
                } else if (index >= length) {
                    lineComment = false;
                    comment += ch;
                    loc.end = {
                        line: lineNumber,
                        column: length - lineStart
                    };
                    addComment('Line', comment, start, length, loc);
                } else {
                    comment += ch;
                }
            } else if (blockComment) {
                if (isLineTerminator(ch)) {
                    if (ch === '\r' && source[index + 1] === '\n') {
                        ++index;
                        comment += '\r\n';
                    } else {
                        comment += ch;
                    }
                    ++lineNumber;
                    ++index;
                    lineStart = index;
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    ch = source[index++];
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    comment += ch;
                    if (ch === '*') {
                        ch = source[index];
                        if (ch === '/') {
                            comment = comment.substr(0, comment.length - 1);
                            blockComment = false;
                            ++index;
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            addComment('Block', comment, start, index, loc);
                            comment = '';
                        }
                    }
                }
            } else if (ch === '/') {
                ch = source[index + 1];
                if (ch === '/') {
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart
                        }
                    };
                    start = index;
                    index += 2;
                    lineComment = true;
                    if (index >= length) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index, loc);
                    }
                } else if (ch === '*') {
                    start = index;
                    index += 2;
                    blockComment = true;
                    loc = {
                        start: {
                            line: lineNumber,
                            column: index - lineStart - 2
                        }
                    };
                    if (index >= length) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                } else {
                    break;
                }
            } else if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch ===  '\r' && source[index] === '\n') {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else {
                break;
            }
        }
    }

    function filterCommentLocation() {
        var i, entry, comment, comments = [];

        for (i = 0; i < extra.comments.length; ++i) {
            entry = extra.comments[i];
            comment = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                comment.range = entry.range;
            }
            if (extra.loc) {
                comment.loc = entry.loc;
            }
            comments.push(comment);
        }

        extra.comments = comments;
    }

    function collectToken() {
        var start, loc, token, range, value;

        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = extra.advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            range = [token.range[0], token.range[1]];
            value = sliceSource(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }

        return token;
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = extra.scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        // Pop the previous token, which is likely '/' or '/='
        if (extra.tokens.length > 0) {
            token = extra.tokens[extra.tokens.length - 1];
            if (token.range[0] === pos && token.type === 'Punctuator') {
                if (token.value === '/' || token.value === '/=') {
                    extra.tokens.pop();
                }
            }
        }

        extra.tokens.push({
            type: 'RegularExpression',
            value: regex.literal,
            range: [pos, index],
            loc: loc
        });

        return regex;
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function createLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value
        };
    }

    function createRawLiteral(token) {
        return {
            type: Syntax.Literal,
            value: token.value,
            raw: sliceSource(token.range[0], token.range[1])
        };
    }

    function createLocationMarker() {
        var marker = {};

        marker.range = [index, index];
        marker.loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            },
            end: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        marker.end = function () {
            this.range[1] = index;
            this.loc.end.line = lineNumber;
            this.loc.end.column = index - lineStart;
        };

        marker.applyGroup = function (node) {
            if (extra.range) {
                node.groupRange = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.groupLoc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        marker.apply = function (node) {
            if (extra.range) {
                node.range = [this.range[0], this.range[1]];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.loc.start.line,
                        column: this.loc.start.column
                    },
                    end: {
                        line: this.loc.end.line,
                        column: this.loc.end.column
                    }
                };
            }
        };

        return marker;
    }

    function trackGroupExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();
        expect('(');

        expr = parseExpression();

        expect(')');

        marker.end();
        marker.applyGroup(expr);

        return expr;
    }

    function trackLeftHandSideExpression() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function trackLeftHandSideExpressionAllowCall() {
        var marker, expr;

        skipComment();
        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                expr = {
                    type: Syntax.CallExpression,
                    callee: expr,
                    'arguments': parseArguments()
                };
                marker.end();
                marker.apply(expr);
            } else if (match('[')) {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: true,
                    object: expr,
                    property: parseComputedMember()
                };
                marker.end();
                marker.apply(expr);
            } else {
                expr = {
                    type: Syntax.MemberExpression,
                    computed: false,
                    object: expr,
                    property: parseNonComputedMember()
                };
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function filterGroup(node) {
        var n, i, entry;

        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
        for (i in node) {
            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                entry = node[i];
                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                    n[i] = entry;
                } else {
                    n[i] = filterGroup(entry);
                }
            }
        }
        return n;
    }

    function wrapTrackingFunction(range, loc) {

        return function (parseFunction) {

            function isBinary(node) {
                return node.type === Syntax.LogicalExpression ||
                    node.type === Syntax.BinaryExpression;
            }

            function visit(node) {
                var start, end;

                if (isBinary(node.left)) {
                    visit(node.left);
                }
                if (isBinary(node.right)) {
                    visit(node.right);
                }

                if (range) {
                    if (node.left.groupRange || node.right.groupRange) {
                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                        node.range = [start, end];
                    } else if (typeof node.range === 'undefined') {
                        start = node.left.range[0];
                        end = node.right.range[1];
                        node.range = [start, end];
                    }
                }
                if (loc) {
                    if (node.left.groupLoc || node.right.groupLoc) {
                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                        node.loc = {
                            start: start,
                            end: end
                        };
                    } else if (typeof node.loc === 'undefined') {
                        node.loc = {
                            start: node.left.loc.start,
                            end: node.right.loc.end
                        };
                    }
                }
            }

            return function () {
                var marker, node;

                skipComment();

                marker = createLocationMarker();
                node = parseFunction.apply(null, arguments);
                marker.end();

                if (range && typeof node.range === 'undefined') {
                    marker.apply(node);
                }

                if (loc && typeof node.loc === 'undefined') {
                    marker.apply(node);
                }

                if (isBinary(node)) {
                    visit(node);
                }

                return node;
            };
        };
    }

    function patch() {

        var wrapTracking;

        if (extra.comments) {
            extra.skipComment = skipComment;
            skipComment = scanComment;
        }

        if (extra.raw) {
            extra.createLiteral = createLiteral;
            createLiteral = createRawLiteral;
        }

        if (extra.range || extra.loc) {

            extra.parseGroupExpression = parseGroupExpression;
            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
            parseGroupExpression = trackGroupExpression;
            parseLeftHandSideExpression = trackLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

            extra.parseAdditiveExpression = parseAdditiveExpression;
            extra.parseAssignmentExpression = parseAssignmentExpression;
            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
            extra.parseBitwiseORExpression = parseBitwiseORExpression;
            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
            extra.parseBlock = parseBlock;
            extra.parseFunctionSourceElements = parseFunctionSourceElements;
            extra.parseCatchClause = parseCatchClause;
            extra.parseComputedMember = parseComputedMember;
            extra.parseConditionalExpression = parseConditionalExpression;
            extra.parseConstLetDeclaration = parseConstLetDeclaration;
            extra.parseEqualityExpression = parseEqualityExpression;
            extra.parseExpression = parseExpression;
            extra.parseForVariableDeclaration = parseForVariableDeclaration;
            extra.parseFunctionDeclaration = parseFunctionDeclaration;
            extra.parseFunctionExpression = parseFunctionExpression;
            extra.parseLogicalANDExpression = parseLogicalANDExpression;
            extra.parseLogicalORExpression = parseLogicalORExpression;
            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
            extra.parseNewExpression = parseNewExpression;
            extra.parseNonComputedProperty = parseNonComputedProperty;
            extra.parseObjectProperty = parseObjectProperty;
            extra.parseObjectPropertyKey = parseObjectPropertyKey;
            extra.parsePostfixExpression = parsePostfixExpression;
            extra.parsePrimaryExpression = parsePrimaryExpression;
            extra.parseProgram = parseProgram;
            extra.parsePropertyFunction = parsePropertyFunction;
            extra.parseRelationalExpression = parseRelationalExpression;
            extra.parseStatement = parseStatement;
            extra.parseShiftExpression = parseShiftExpression;
            extra.parseSwitchCase = parseSwitchCase;
            extra.parseUnaryExpression = parseUnaryExpression;
            extra.parseVariableDeclaration = parseVariableDeclaration;
            extra.parseVariableIdentifier = parseVariableIdentifier;

            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
            parseBlock = wrapTracking(extra.parseBlock);
            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
            parseCatchClause = wrapTracking(extra.parseCatchClause);
            parseComputedMember = wrapTracking(extra.parseComputedMember);
            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
            parseExpression = wrapTracking(extra.parseExpression);
            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
            parseNewExpression = wrapTracking(extra.parseNewExpression);
            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
            parseProgram = wrapTracking(extra.parseProgram);
            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
            parseStatement = wrapTracking(extra.parseStatement);
            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
        }

        if (typeof extra.tokens !== 'undefined') {
            extra.advance = advance;
            extra.scanRegExp = scanRegExp;

            advance = collectToken;
            scanRegExp = collectRegex;
        }
    }

    function unpatch() {
        if (typeof extra.skipComment === 'function') {
            skipComment = extra.skipComment;
        }

        if (extra.raw) {
            createLiteral = extra.createLiteral;
        }

        if (extra.range || extra.loc) {
            parseAdditiveExpression = extra.parseAdditiveExpression;
            parseAssignmentExpression = extra.parseAssignmentExpression;
            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
            parseBitwiseORExpression = extra.parseBitwiseORExpression;
            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
            parseBlock = extra.parseBlock;
            parseFunctionSourceElements = extra.parseFunctionSourceElements;
            parseCatchClause = extra.parseCatchClause;
            parseComputedMember = extra.parseComputedMember;
            parseConditionalExpression = extra.parseConditionalExpression;
            parseConstLetDeclaration = extra.parseConstLetDeclaration;
            parseEqualityExpression = extra.parseEqualityExpression;
            parseExpression = extra.parseExpression;
            parseForVariableDeclaration = extra.parseForVariableDeclaration;
            parseFunctionDeclaration = extra.parseFunctionDeclaration;
            parseFunctionExpression = extra.parseFunctionExpression;
            parseGroupExpression = extra.parseGroupExpression;
            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
            parseLogicalANDExpression = extra.parseLogicalANDExpression;
            parseLogicalORExpression = extra.parseLogicalORExpression;
            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
            parseNewExpression = extra.parseNewExpression;
            parseNonComputedProperty = extra.parseNonComputedProperty;
            parseObjectProperty = extra.parseObjectProperty;
            parseObjectPropertyKey = extra.parseObjectPropertyKey;
            parsePrimaryExpression = extra.parsePrimaryExpression;
            parsePostfixExpression = extra.parsePostfixExpression;
            parseProgram = extra.parseProgram;
            parsePropertyFunction = extra.parsePropertyFunction;
            parseRelationalExpression = extra.parseRelationalExpression;
            parseStatement = extra.parseStatement;
            parseShiftExpression = extra.parseShiftExpression;
            parseSwitchCase = extra.parseSwitchCase;
            parseUnaryExpression = extra.parseUnaryExpression;
            parseVariableDeclaration = extra.parseVariableDeclaration;
            parseVariableIdentifier = extra.parseVariableIdentifier;
        }

        if (typeof extra.scanRegExp === 'function') {
            advance = extra.advance;
            scanRegExp = extra.scanRegExp;
        }
    }

    function stringToArray(str) {
        var length = str.length,
            result = [],
            i;
        for (i = 0; i < length; ++i) {
            result[i] = str.charAt(i);
        }
        return result;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        buffer = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.raw = (typeof options.raw === 'boolean') && options.raw;
            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }

                // Force accessing the characters via an array.
                if (typeof source[0] === 'undefined') {
                    source = stringToArray(code);
                }
            }
        }

        patch();
        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                filterCommentLocation();
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
            if (extra.range || extra.loc) {
                program.body = filterGroup(program.body);
            }
        } catch (e) {
            throw e;
        } finally {
            unpatch();
            extra = {};
        }

        return program;
    }

    // Sync with package.json.
    exports.version = '1.0.3';

    exports.parse = parse;

    // Deep copy.
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */

},{}]},{},[57])
(57)
});
;