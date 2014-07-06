!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.JscsStringChecker=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * Returns the lines from a file with comments removed. Will report erroneous
 * trailing tokens in multiline comments if an error reporter is provided.
 *
 * @param {JsFile} file
 * @param {Errors} [errors=null] errors
 * @returns {Array}
 */
exports.getLinesWithCommentsRemoved = function(file, errors) {
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
};

},{}],2:[function(_dereq_,module,exports){
var colors = _dereq_('colors');

/**
 * Set of errors for specified file.
 *
 * @name Errors
 */
var Errors = function(file) {
    this._errorList = [];
    this._file = file;
    this._currentRule = '';
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
            rule: this._currentRule,
            message: message,
            line: line,
            column: column || 0
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
    getErrorCount: function() {
        return this._errorList.length;
    },

    /**
     * Formats error for further output.
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
    },

   /**
     * Sets the current rule so that errors are aware
     * of which rule triggered them.
     *
     * @param {String} rule
     */
    setCurrentRule: function(rule) {
        this._currentRule = rule;
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

},{"colors":88}],3:[function(_dereq_,module,exports){
var treeIterator = _dereq_('./tree-iterator');

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
    var _this = this;
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

},{"./tree-iterator":79}],4:[function(_dereq_,module,exports){
var presets = {
    // https://contribute.jquery.org/style-guide/js/
    jquery: _dereq_('../../presets/jquery.json'),
    // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    google: _dereq_('../../presets/google.json'),
    // https://github.com/ymaps/codestyle/blob/master/js.md
    yandex: _dereq_('../../presets/yandex.json'),
    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    wikimedia: _dereq_('../../presets/wikimedia.json')
};

module.exports = {
    /**
     * Get does not exist error
     * @param {String} preset
     * @return {String}
     */
    getDoesNotExistError: function(preset) {
        return 'Preset "' + preset + '" does not exist';
    },
    /**
     * Is preset exists in jscs
     * @param {String} preset
     * @return {Boolean}
     */
    exists: function(preset) {
        return !!presets[preset];
    },

    /**
     * Extend jscs config with preset rules
     * @param {Object} config
     * @return {Boolean}
     */
    extend: function(config) {
        if (!config.preset) {
            return true;
        }

        var preset = presets[config.preset];

        if (!preset) {
            return false;
        }

        delete config.preset;
        for (var rule in preset) {
            if (!(rule in config)) {
                config[rule] = preset[rule];
            }
        }

        return true;
    }
};

},{"../../presets/google.json":90,"../../presets/jquery.json":91,"../../presets/wikimedia.json":92,"../../presets/yandex.json":93}],5:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],6:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'disallowDanglingUnderscores';
    },

    check: function(file, errors) {
        var allowedIdentifiers = this._allowedIdentifiers;

        file.iterateTokensByType('Identifier', function(token) {
            var value = token.value;
            if ((value[0] === '_' || value.slice(-1) === '_') &&
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

},{"assert":81}],7:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'disallowEmptyBlocks';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length === 0 &&
                node.parentNode.type !== 'CatchClause' &&
                node.parentNode.type !== 'FunctionDeclaration' &&
                node.parentNode.type !== 'FunctionExpression') {
                errors.add('Empty block found', node.loc.end);
            }
        });
    }

};

},{"assert":81}],8:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(types) {
        assert(Array.isArray(types), 'disallowImplicitTypeConversion option requires array value');
        this._typeIndex = {};
        for (var i = 0, l = types.length; i < l; i++) {
            this._typeIndex[types[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowImplicitTypeConversion';
    },

    check: function(file, errors) {
        var types = this._typeIndex;
        if (types.numeric || types.boolean || types.binary) {
            file.iterateNodesByType('UnaryExpression', function(node) {
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
            file.iterateNodesByType('BinaryExpression', function(node) {
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

},{"assert":81}],9:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
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

},{"assert":81}],10:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
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

},{"assert":81}],11:[function(_dereq_,module,exports){
module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'disallowLeftStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The disallowLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceBeforeBinaryOperators' +
            '\nrequireSpaceBeforePostfixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression',
            1,
            0
        );
    }

};

},{}],12:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMixedSpacesAndTabs) {
        assert(
            disallowMixedSpacesAndTabs === true || disallowMixedSpacesAndTabs === 'smart',
            'disallowMixedSpacesAndTabs option requires true or "smart" value'
        );

        this._disallowMixedSpacesAndTabs = disallowMixedSpacesAndTabs;
    },

    getOptionName: function() {
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
                    for (var x = startIndex; x < end.line; x++) {
                        // remove all multine content to the right of the star
                        var starPos = lines[x].search(/ \*/);
                        if (starPos > -1) {
                            lines[x] = lines[x].substring(0, starPos + 2);
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

},{"assert":81}],13:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],14:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],15:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function(node) {
            // allow multiple var declarations in for statement
            // for (var i = 0, j = myArray.length; i < j; i++) {}
            if (node.declarations.length > 1 && node.parentNode.type !== 'ForStatement') {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};

},{"assert":81}],16:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowPaddingNewlinesInBlocks) {
        assert(
            disallowPaddingNewlinesInBlocks === true,
            'disallowPaddingNewlinesInBlocks option requires the value true or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowPaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        var tokens = file.getTokens();

        file.iterateNodesByType('BlockStatement', function(node) {
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
            var openingBracket = tokens[openingBracketPos];
            var startLine = openingBracket.loc.start.line;

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var closingLine = closingBracket.loc.start.line;

            if (startLine === closingLine) {
                return;
            }

            if (lines[startLine] === '') {
                errors.add('Expected no padding newline after opening curly brace', openingBracket.loc.end);
            }

            if (lines[closingLine - 2] === '') {
                errors.add('Expected no padding newline before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};

},{"assert":81}],17:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var utils = _dereq_('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            disallowQuotedKeysInObjects === true || disallowQuotedKeysInObjects === 'allButReserved',
            this.getOptionName() + ' options should be true or "allButReserved" value'
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

},{"../utils":80,"assert":81}],18:[function(_dereq_,module,exports){
module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'disallowRightStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The disallowRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceAfterBinaryOperators' +
            '\nrequireSpaceAfterPrefixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression',
            1,
            0
        );
    }

};

},{}],19:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');
var allOperators = _dereq_('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {
    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'disallowSpaceAfterBinaryOperators option requires array or true value'
        );

        if (isTrue) {
            operators = allOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var nextToken = tokens[i + 1];

            if (nextToken && nextToken.range[0] !== token.range[1]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should stick to following expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        // ":" for object property only but not for ternary
        if (operators[':']) {
            file.iterateNodesByType(['ObjectExpression'], function(node) {
                node.properties.forEach(function(prop) {
                    var token = tokenHelper.findOperatorByRangeStart(file, prop.range[0], ':'),
                        tokens = file.getTokens();

                    errorIfApplicable(token, tokens.indexOf(token), tokens, ':');
                });
            });
        }

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;
                if (operator !== ',') {
                    return;
                }

                errorIfApplicable(token, i, tokens, operator);
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                if (!operators[operator] || node.init === null) {
                    return;
                }

                var range = (isDec ? node.init : node.right).range[0];

                var indent = tokenHelper.isTokenParenthesis(file, range - 1, true) ?
                    operator.length + 1 :
                    operator.length;

                var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                    file,
                    range - indent,
                    operator,
                    true
                );

                if (!part) {
                    var loc = tokenHelper.findOperatorByRangeStart(
                        file, range, operator, true
                    ).loc.start;

                    errors.add(
                        'Operator ' + operator + ' should stick to following expression',
                        loc.line,
                        tokenHelper.getPointerEntities(loc.column, operator.length)
                    );
                }
            }
        );
    }

};

},{"../token-helper":78,"../utils":80,"assert":81}],20:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'disallowSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
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

},{"assert":81}],21:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpaceAfterLineComment) {
        assert(
            disallowSpaceAfterLineComment === true,
            'disallowSpaceAfterLineComment option requires the value true'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceAfterLineComment';
    },

    check: function(file, errors) {
        var comments = file.getComments();

        comments.forEach(function(comment) {
            if (comment.type === 'Line') {
                var value = comment.value;
                if (value.length > 0 && value[0] === ' ') {
                    errors.add('Illegal space after line comment', comment.loc.start);
                }
            }
        });
    }
};

},{"assert":81}],22:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

},{"assert":81}],23:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var defaultOperators = _dereq_('../utils').unaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function(node) {
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

},{"../utils":80,"assert":81}],24:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');
var allOperators = _dereq_('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'disallowSpaceBeforeBinaryOperators option requires array or true value'
        );

        if (isTrue) {
            operators = allOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.range[1] !== token.range[0]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should stick to preceding expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        // ":" for object property only but not for ternar
        if (operators[':']) {
            file.iterateNodesByType(['ObjectExpression'], function(node) {
                node.properties.forEach(function(prop) {
                    var token = tokenHelper.findOperatorByRangeStart(file, prop.range[0], ':'),
                        tokens = file.getTokens();

                    errorIfApplicable(token, tokens.indexOf(token), tokens, ':');
                });
            });
        }

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;
                if (operator !== ',') {
                    return;
                }

                var prevToken = tokens[i - 1];

                // Do not report error if comma not on the same line with the first operand #467
                if (token.loc.start.line === prevToken.loc.start.line) {
                    errorIfApplicable(token, i, tokens, operator);
                }
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                // !node.init is it's an empty assignment
                if (!operators[operator] || node.init === null) {
                    return;
                }

                var range = (isDec ? node.id : node.left).range;
                var part = tokenHelper.getTokenByRangeStartIfPunctuator(file, range[1], operator);

                if (!part) {
                    errors.add(
                        'Operator ' + node.operator + ' should stick to preceding expression',
                        tokenHelper.findOperatorByRangeStart(
                            file, range[0], operator
                        ).loc.start
                    );
                }
            }
        );
    }

};

},{"../token-helper":78,"../utils":80,"assert":81}],25:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSpaceBeforeBlockStatements) {
        assert(
            typeof disallowSpaceBeforeBlockStatements === 'boolean',
            'disallowSpaceBeforeBlockStatements option requires boolean value'
        );
        assert(
            disallowSpaceBeforeBlockStatements === true,
            'disallowSpaceBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType('BlockStatement', function(node) {
            var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.range[0] - 1);
            var tokenBeforeBody = tokens[tokenBeforeBodyPos];
            if (!tokenBeforeBody) {
                errors.add(
                    'Extra space before opening curly brace for block expressions',
                    node.loc.start
                );
            }
        });
    }

};

},{"assert":81}],26:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var defaultOperators = _dereq_('../utils').incrementAndDecrementOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function(node) {
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

},{"../utils":80,"assert":81}],27:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'disallowSpacesInAnonymousFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'disallowSpacesInAnonymousFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'disallowSpacesInAnonymousFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'disallowSpacesInAnonymousFunctionExpression must have beforeOpeningCurlyBrace ' +
            ' or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'disallowSpacesInAnonymousFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionExpression'], function(node) {
            var parent = node.parentNode;

            // Ignore syntactic sugar for getters and setters.
            if (parent.type === 'Property' && (parent.kind === 'get' || parent.kind === 'set')) {
                return;
            }

            // anonymous function expressions only
            if (!node.id) {

                if (beforeOpeningRoundBrace) {
                    var nodeBeforeRoundBrace = node;

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
            }
        });
    }

};

},{"assert":81}],28:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        var validProperties = [
            'afterTest',
            'beforeConsequent',
            'afterConsequent',
            'beforeAlternate'
        ];
        var optionName = this.getOptionName();

        if (options === true) {
            options = {
                'afterTest': true,
                'beforeConsequent': true,
                'afterConsequent': true,
                'beforeAlternate': true
            };
        }

        assert(
            typeof options === 'object',
            optionName + ' option must be an object or boolean true'
        );

        var isProperlyConfigured = validProperties.some(function(key) {
            var isPresent = key in options;

            if (isPresent) {
                assert(
                    options[key] === true,
                    optionName + '.' + key + ' property requires true value or should be removed'
                );
            }

            return isPresent;
        });

        assert(
            isProperlyConfigured,
            optionName + ' must have at least 1 of the following properties: ' + validProperties.join(', ')
        );

        validProperties.forEach(function(property) {
            this['_' + property] = Boolean(options[property]);
        }.bind(this));
    },

    getOptionName: function() {
        return 'disallowSpacesInConditionalExpression';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType(['ConditionalExpression'], function(node) {

            var test = node.test;
            var testTokenPos = file.getTokenPosByRangeStart(test.range[0]);
            var consequent = node.consequent;
            var consequentTokenPos = file.getTokenPosByRangeStart(consequent.range[0]);
            var alternate = node.alternate;
            var questionMarkToken = tokens[testTokenPos + 1];
            var colonToken = tokens[consequentTokenPos + 1];
            var questionMark;
            var colon;

            if (this._afterTest && test.loc.end.line === questionMarkToken.loc.start.line) {
                questionMark = tokens[file.getTokenPosByRangeStart(test.range[1])];
                if (!questionMark || questionMark.value !== '?') {
                    errors.add(
                        'Illegal space after test',
                        test.loc.end
                    );
                }
            }

            if (this._beforeConsequent && consequent.loc.end.line === questionMarkToken.loc.start.line) {
                questionMark = tokens[file.getTokenPosByRangeStart(consequent.range[0] - 1)];
                if (!questionMark || questionMark.value !== '?') {
                    errors.add(
                        'Illegal space before consequent',
                        consequent.loc.start
                    );
                }
            }

            if (this._afterConsequent && consequent.loc.end.line === colonToken.loc.start.line) {
                colon = tokens[file.getTokenPosByRangeStart(consequent.range[1])];
                if (!colon || colon.value !== ':') {
                    errors.add(
                        'Illegal space after consequent',
                        consequent.loc.end
                    );
                }
            }

            if (this._beforeAlternate && alternate.loc.end.line === colonToken.loc.start.line) {
                colon = tokens[file.getTokenPosByRangeStart(alternate.range[0] - 1)];
                if (!colon || colon.value !== ':') {
                    errors.add(
                        'Illegal space before alternate',
                        alternate.loc.start
                    );
                }
            }
        }.bind(this));
    }

};

},{"assert":81}],29:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'disallowSpacesInFunctionDeclaration option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'disallowSpacesInFunctionDeclaration.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'disallowSpacesInFunctionDeclaration.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'disallowSpacesInFunctionDeclaration must have beforeOpeningCurlyBrace or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'disallowSpacesInFunctionDeclaration';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionDeclaration'], function(node) {

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

},{"assert":81}],30:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'disallowSpacesInFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var parent = node.parentNode;

            // Ignore syntactic sugar for getters and setters.
            if (parent.type === 'Property' && (parent.kind === 'get' || parent.kind === 'set')) {
                return;
            }

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

},{"assert":81}],31:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'disallowSpacesInNamedFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'disallowSpacesInNamedFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'disallowSpacesInNamedFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'disallowSpacesInNamedFunctionExpression must have beforeOpeningCurlyBrace ' +
            'or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'disallowSpacesInNamedFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionExpression'], function(node) {

            // named function expressions only
            if (node.id) {

                if (beforeOpeningRoundBrace) {
                    var nodeBeforeRoundBrace = node.id;

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
            }
        });
    }

};

},{"assert":81}],32:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            disallow === true || disallow === 'all' || disallow === 'nested',
            this.getOptionName() + ' option requires "all"(true value) or "nested" string'
        );

        this._mode = disallow === true ? 'all' : disallow;
    },

    getOptionName: function() {
        return 'disallowSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;

        file.iterateNodesByType(['ArrayExpression'], function(node) {
            var tokens = file.getTokens();

            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);

            var brackets = {
                opening: tokens[openingBracketPos],
                closing: tokens[closingBracketPos]
            };

            var insideTokens = {
                prev: tokens[closingBracketPos - 1],
                next: tokens[openingBracketPos + 1]
            };

            if (mode === 'all') {
                check(brackets, errors, insideTokens);

            } else if (node.parentNode.type === 'ArrayExpression') {
                check(brackets, errors, insideTokens);
            }
        });
    }
};

function check(brackets, errors, insideTokens) {
    if (brackets.opening.loc.start.line === insideTokens.next.loc.start.line &&
        brackets.opening.range[1] !== insideTokens.next.range[0]
    ) {
        errors.add('Illegal space after opening square brace', brackets.opening.loc.end);
    }

    if (brackets.closing.loc.start.line === insideTokens.prev.loc.start.line &&
        brackets.closing.range[0] !== insideTokens.prev.range[1]
    ) {
        errors.add('Illegal space before closing square brace', insideTokens.prev.loc.end);
    }
}

},{"assert":81}],33:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowSpacesInsideObjectBrackets) {
        assert(
            disallowSpacesInsideObjectBrackets === true || disallowSpacesInsideObjectBrackets === 'all' ||
            disallowSpacesInsideObjectBrackets === 'nested',
            'disallowSpacesInsideObjectBrackets option requires "all"(true value) or "nested" string'
        );

        this._mode = disallowSpacesInsideObjectBrackets === true ? 'all' : disallowSpacesInsideObjectBrackets;
    },

    getOptionName: function() {
        return 'disallowSpacesInsideObjectBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;

        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();

            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);
            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);

            var brackets = {
                opening: tokens[openingBracketPos],
                closing: tokens[closingBracketPos]
            };

            var insideTokens = {
                prev: tokens[closingBracketPos - 1],
                next: tokens[openingBracketPos + 1]
            };

            if (mode === 'all') {
                check(brackets, errors, insideTokens);

            } else if (node.parentNode.type === 'Property') {
                check(brackets, errors, insideTokens);
            }
        });
    }
};

function check(brackets, errors, insideTokens) {
    if (brackets.opening.loc.start.line === insideTokens.next.loc.start.line &&
        brackets.opening.range[1] !== insideTokens.next.range[0]
    ) {
        errors.add('Illegal space after opening curly brace', brackets.opening.loc.end);
    }

    if (brackets.closing.loc.start.line === insideTokens.prev.loc.start.line &&
        brackets.closing.range[0] !== insideTokens.prev.range[1]
    ) {
        errors.add('Illegal space before closing curly brace', insideTokens.prev.loc.end);
    }
}

},{"assert":81}],34:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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
        function isCommentInRange(start, end) {
            return file.getComments().some(function(comment) {
                return start <= comment.range[0] && end >= comment.range[1];
            });
        }
        file.iterateTokensByType('Punctuator', function(token, index, tokens) {
            if (token.value === '(') {
                var nextToken = tokens[index + 1];
                if (token.range[1] !== nextToken.range[0] &&
                        token.loc.end.line === nextToken.loc.start.line &&
                        !isCommentInRange(token.range[1], nextToken.range[0])) {
                    errors.add('Illegal space after opening round bracket', token.loc.end);
                }
            }

            if (token.value === ')') {
                var prevToken = tokens[index - 1];
                if (prevToken.range[1] !== token.range[0] &&
                        prevToken.loc.end.line === token.loc.start.line &&
                        !isCommentInRange(prevToken.range[1], token.range[0])) {
                    errors.add('Illegal space before closing round bracket', prevToken.loc.end);
                }
            }
        });
    }

};

},{"assert":81}],35:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowTrailingComma) {
        assert(
            typeof disallowTrailingComma === 'boolean',
            'disallowTrailingComma option requires boolean value'
        );
        assert(
            disallowTrailingComma === true,
            'disallowTrailingComma option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowTrailingComma';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.type === 'Punctuator' &&
                    (nextToken.value === '}' || nextToken.value === ']')) {
                    errors.add(
                        'Extra comma following the final element of an array or object literal',
                        token.loc.start
                    );
                }
            }
        });
    }

};

},{"assert":81}],36:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],37:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'disallowYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function(node) {
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

},{"assert":81}],38:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var commentHelper = _dereq_('../comment-helper');

module.exports = function() {};

module.exports.prototype = {

    configure: function(maximumLineLength) {
        this._tabSize = '';
        this._allowRegex = false;
        this._allowComments = false;
        this._allowUrlComments = false;

        if (typeof maximumLineLength === 'object') {
            assert(
                typeof maximumLineLength.value === 'number',
                'maximumLineLength option requires the "value" property to be defined'
            );

            this._maximumLineLength = maximumLineLength.value;
            var tabSize = maximumLineLength.tabSize || 0;

            while (tabSize--) {
                this._tabSize += ' ';
            }

            this._allowRegex = (maximumLineLength.allowRegex === true);
            this._allowComments = (maximumLineLength.allowComments === true);
            this._allowUrlComments = (maximumLineLength.allowUrlComments === true);
        } else {
            assert(
                typeof maximumLineLength === 'number',
                'maximumLineLength option requires number value or options object'
            );

            this._maximumLineLength = maximumLineLength;
        }
    },

    getOptionName: function() {
        return 'maximumLineLength';
    },

    check: function(file, errors) {
        var maximumLineLength = this._maximumLineLength;

        var lines = this._allowComments ? commentHelper.getLinesWithCommentsRemoved(file) : file.getLines();
        var line;

        if (this._allowRegex) {
            file.iterateTokensByType('RegularExpression', function(token) {
                for (var i = token.loc.start.line; i <= token.loc.end.line; i++) {
                    lines[i - 1] = '';
                }
            });
        }

        if (this._allowUrlComments) {
            file.getComments().forEach(function(comment) {
                for (var i = comment.loc.start.line; i <= comment.loc.end.line; i++) {
                    lines[i - 1] = lines[i - 1].replace(/(http|https|ftp):\/\/[^\s$]+/, '');
                }
            });
        }

        for (var i = 0, l = lines.length; i < l; i++) {
            line = this._tabSize ? lines[i].replace(/\t/g, this._tabSize) : lines[i];

            if (line.length > maximumLineLength) {
                errors.add(
                    'Line must be at most ' + maximumLineLength + ' characters',
                    i + 1,
                    lines[i].length
                );
            }
        }
    }

};

},{"../comment-helper":1,"assert":81}],39:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': 'all',
            'ignoreFunction': 'ignoreFunction',
            'ignoreLineBreak': 'ignoreLineBreak',
            'skipWithFunction': 'ignoreFunction',
            'skipWithLineBreak': 'ignoreLineBreak'
        };
        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + ' requires one of the following values: ' + Object.keys(modes).join(', ')
        );
        this._mode = modes[mode];
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

            var maxKeyEndPos = 0;
            var skip = node.properties.some(function(property, index) {
                maxKeyEndPos = Math.max(maxKeyEndPos, property.key.loc.end.column);

                if (mode === 'ignoreFunction' && property.value.type === 'FunctionExpression') {
                    return true;
                }

                if (mode === 'ignoreLineBreak' && index > 0 &&
                     node.properties[index - 1].loc.end.line !== property.loc.start.line - 1) {
                    return true;
                }
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

},{"assert":81}],40:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireBlocksOnNewline) {
        assert(
            requireBlocksOnNewline === true || typeof requireBlocksOnNewline === 'number',
            'requireBlocksOnNewline option requires the value true or an Integer'
        );

        this._minStatements = requireBlocksOnNewline === true ? 0 : requireBlocksOnNewline;
    },

    getOptionName: function() {
        return 'requireBlocksOnNewline';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;

        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length <= minStatements) {
                return;
            }
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line) {
                errors.add('Missing newline before closing curly brace', prevToken.loc.end);
            }
        });
    }

};

},{"assert":81}],41:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireCamelCase) {
        assert(
            requireCamelCase === true || requireCamelCase === 'ignoreProperties',
            'requireCamelCaseOrUpperCaseIdentifiers option requires true value or `ignoreProperties` string'
        );

        this._ignoreProperties = (requireCamelCase === 'ignoreProperties');
    },

    getOptionName: function() {
        return 'requireCamelCaseOrUpperCaseIdentifiers';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Identifier', function(token, index, tokens) {
            var value = token.value;
            if (value.replace(/^_+|_+$/g, '').indexOf('_') === -1 || value.toUpperCase() === value) {
                return;
            }
            if (this._ignoreProperties) {
                if (index + 1 < tokens.length && tokens[index + 1].value === ':') {
                    return;
                }
                if (index > 0 && tokens[index - 1].value === '.') {
                    return;
                }
            }
            errors.add(
                'All identifiers must be camelCase or UPPER_CASE',
                token.loc.start.line,
                token.loc.start.column
            );
        }.bind(this));
    }

};

},{"assert":81}],42:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],43:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],44:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(statementTypes) {
        assert(Array.isArray(statementTypes), 'requireCurlyBraces option requires array value');
        this._typeIndex = {};
        for (var i = 0, l = statementTypes.length; i < l; i++) {
            this._typeIndex[statementTypes[i]] = true;
        }
    },

    getOptionName: function() {
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
            file.iterateNodesByType(type, function(node) {
                if (node.body && node.body.type !== 'BlockStatement') {
                    addError(typeString, node);
                }
            });
        }

        var typeIndex = this._typeIndex;
        if (typeIndex['if'] || typeIndex['else']) {
            file.iterateNodesByType('IfStatement', function(node) {
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
            file.iterateNodesByType('SwitchCase', function(node) {
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

},{"assert":81}],45:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var utils = _dereq_('../utils');

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

},{"../utils":80,"assert":81}],46:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireKeywordsOnNewLine option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
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

},{"assert":81}],47:[function(_dereq_,module,exports){
module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'requireLeftStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The requireLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceBeforeBinaryOperators' +
            '\ndisallowSpaceBeforePostfixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression',
            1,
            0
        );
    }

};

},{}],48:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'requireLineFeedAtFileEnd';
    },

    check: function(file, errors) {
        var lines = file.getLines();
        if (lines[lines.length - 1] !== '') {
            errors.add('Missing line feed at file end', lines.length, 0);
        }
    }

};

},{"assert":81}],49:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

function consecutive(file, errors) {
    file.iterateNodesByType('VariableDeclaration', function(node) {
        var pos = node.parentCollection.indexOf(node);
        if (pos < node.parentCollection.length - 1) {
            var sibling = node.parentCollection[pos + 1];
            if (sibling.type === 'VariableDeclaration' && sibling.kind === node.kind) {
                errors.add(
                    node.kind[0].toUpperCase() + node.kind.slice(1) + ' declarations should be joined',
                    sibling.loc.start
                );
            }
        }
    });
}

function onevar(file, errors) {
    file.iterateNodesByType(['Program', 'FunctionDeclaration', 'FunctionExpression'], function(node) {
        var firstVar = true;
        var firstConst = true;
        var firstParent = true;

        file.iterate(function(node) {
            var type = node && node.type;
            var kind = node && node.kind;

            // Don't go in nested scopes
            if (!firstParent && type && ['FunctionDeclaration', 'FunctionExpression'].indexOf(type) > -1) {
                return false;
            }

            if (firstParent) {
                firstParent = false;
            }

            if (type === 'VariableDeclaration') {
                if (kind === 'var') {
                    if (!firstVar) {
                        errors.add(
                            'Var declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstVar = false;
                    }
                }

                if (kind === 'const') {
                    if (!firstConst) {
                        errors.add(
                            'Const declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstConst = false;
                    }
                }
            }
        }, node);
    });
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMultipleVarDecl) {
        assert(
            typeof requireMultipleVarDecl === 'boolean' ||
            typeof requireMultipleVarDecl === 'string',
            'requireMultipleVarDecl option requires boolean or string'
        );
        assert(
            requireMultipleVarDecl === true || requireMultipleVarDecl === 'onevar',
            'requireMultipleVarDecl option requires true value or `onevar` string'
        );

        this._check = typeof requireMultipleVarDecl === 'string' ? onevar : consecutive;
    },

    getOptionName: function() {
        return 'requireMultipleVarDecl';
    },

    check: function() {
        return this._check.apply(this, arguments);
    }
};

},{"assert":81}],50:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');
var defaultOperators = _dereq_('../utils').binaryOperators.slice();

defaultOperators.push('?');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireOperatorBeforeLineBreak option requires array value or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireOperatorBeforeLineBreak';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        var tokens = file.getTokens();
        var throughTokens = ['?', ':', ','];

        function errorIfApplicable(token, i, tokens) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + token.value + ' should not be on a new line',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        throughTokens = throughTokens.filter(function(operator) {
            return operators[operator];
        });

        if (throughTokens.length) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;

                if (throughTokens.every(function() {
                    return throughTokens.indexOf(operator) >= 0;
                })) {
                    errorIfApplicable(token, i, tokens, operator);
                }
            });
        }

        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression'],
            function(node) {
                var operator = node.operator;

                if (!operators[operator]) {
                    return;
                }

                var token = tokenHelper.findOperatorByRangeStart(
                    file,
                    node.left.argument ? node.left.argument.range[0] : node.left.range[0],
                    operator
                );

                errorIfApplicable(
                    token,
                    tokens.indexOf(token),
                    tokens
                );
            }
        );
    }
};

},{"../token-helper":78,"../utils":80,"assert":81}],51:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requirePaddingNewlinesInBlocks) {
        assert(
            requirePaddingNewlinesInBlocks === true || typeof requirePaddingNewlinesInBlocks === 'number',
            'requirePaddingNewlinesInBlocks option requires the value true or an Integer'
        );

        this._minStatements = requirePaddingNewlinesInBlocks === true ? 0 : requirePaddingNewlinesInBlocks;
    },

    getOptionName: function() {
        return 'requirePaddingNewlinesInBlocks';
    },

    check: function(file, errors) {
        var minStatements = this._minStatements;

        file.iterateNodesByType('BlockStatement', function(node) {
            if (node.body.length <= minStatements) {
                return;
            }

            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (nextToken.loc.start.line - openingBracket.loc.start.line < 2) {
                errors.add('Expected a padding newline after opening curly brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line - prevToken.loc.start.line < 2) {
                errors.add('Expected a padding newline before closing curly brace', prevToken.loc.end);
            }

            file.getComments().some(function(comment) {
                if (comment.range[1] < openingBracket.range[0] || closingBracket.range[1] < comment.range[0]) {
                    return false;
                }

                if (comment.loc.start.line - openingBracket.loc.start.line < 2) {
                    errors.add('Expected a padding newline after opening curly brace', comment.loc.start);
                } else if (closingBracket.loc.start.line - comment.loc.end.line < 2) {
                    errors.add('Expected a padding newline before closing curly brace', comment.loc.end);
                }

                return false;
            });
        });
    }

};

},{"assert":81}],52:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'requireParenthesesAroundIIFE';
    },

    check: function(file, errors) {

        function isWrapped(node) {
            var tokens = file.getTokens();
            var openingToken = file.getTokenPosByRangeStart(node.range[0]);
            var closingToken = file.getTokenPosByRangeStart(node.range[1] - 1);

            return tokens[openingToken - 1].value + tokens[closingToken + 1].value === '()';
        }

        file.iterateNodesByType('CallExpression', function(node) {
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

},{"assert":81}],53:[function(_dereq_,module,exports){
module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'requireRightStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The requireRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceAfterBinaryOperators' +
            '\ndisallowSpaceAfterPrefixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression',
            1,
            0
        );
    }

};

},{}],54:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');
var allOperators = _dereq_('../utils').binaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireSpaceAfterBinaryOperators option requires array or true value'
        );

        if (isTrue) {
            operators = allOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var nextToken = tokens[i + 1];

            if (token && nextToken && nextToken.range[0] === token.range[1]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should not stick to following expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        // ":" for object property only but not for ternar
        if (operators[':']) {
            file.iterateNodesByType(['ObjectExpression'], function(node) {
                node.properties.forEach(function(prop) {
                    var token = tokenHelper.findOperatorByRangeStart(file, prop.range[0], ':'),
                        tokens = file.getTokens();

                    errorIfApplicable(token, tokens.indexOf(token), tokens, ':');
                });
            });
        }

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;
                if (operator !== ',') {
                    return;
                }

                errorIfApplicable(token, i, tokens, operator);
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                if (!operators[operator] || node.init === null) {
                    return;
                }

                var range = (isDec ? node.init : node.right).range[0];

                var indent = tokenHelper.isTokenParenthesis(file, range - 1, true) ?
                    operator.length + 1 :
                    operator.length;

                var part = tokenHelper.getTokenByRangeStartIfPunctuator(
                    file,
                    range - indent,
                    operator,
                    true
                );

                if (part) {
                    var loc = part.loc.start;

                    errors.add(
                        'Operator ' + operator + ' should not stick to following expression',
                        loc.line,
                        tokenHelper.getPointerEntities(loc.column, operator.length)
                    );
                }
            }
        );
    }

};

},{"../token-helper":78,"../utils":80,"assert":81}],55:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var util = _dereq_('util');
var texts = [
    'Missing space after "%s" keyword',
    'Should be one space instead of %d, after "%s" keyword'
];

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(Array.isArray(keywords), 'requireSpaceAfterKeywords option requires array value');
        this._keywordIndex = {};
        for (var i = 0, l = keywords.length; i < l; i++) {
            this._keywordIndex[keywords[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterKeywords';
    },

    check: function(file, errors) {
        var keywordIndex = this._keywordIndex;

        function getCommentIfExists(start, end) {
            return file.getComments().filter(function(comment) {
                return start <= comment.range[0] && end >= comment.range[1];
            })[0];
        }

        file.iterateTokensByType(['Keyword'], function(token, i, tokens) {
            if (keywordIndex[token.value]) {
                var nextToken = tokens[i + 1];
                var comment = getCommentIfExists(token.range[1], nextToken.range[0]);
                nextToken = comment || nextToken;

                var diff = nextToken.range[0] - token.range[1];

                if (nextToken &&
                    nextToken.loc.end.line === token.loc.start.line &&
                    diff !== 1
                ) {
                    if (nextToken.type !== 'Punctuator' || nextToken.value !== ';') {
                        errors.add(
                            util.format.apply(null,
                                diff === 1 ?
                                    [texts[0], token.value] :
                                    [texts[1], diff, token.value]
                            ),
                            nextToken.loc.start.line,
                            nextToken.loc.start.column
                        );
                    }
                }
            }
        });
    }

};

},{"assert":81,"util":87}],56:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceAfterLineComment) {
        assert(
            requireSpaceAfterLineComment === true,
            'requireSpaceAfterLineComment option requires the value true'
        );
    },

    getOptionName: function() {
        return 'requireSpaceAfterLineComment';
    },

    check: function(file, errors) {
        var comments = file.getComments();

        comments.forEach(function(comment) {
            if (comment.type === 'Line') {
                var value = comment.value;
                if (value.length > 0 && value[0] !== ' ') {
                    errors.add('Missing space after line comment', comment.loc.start);
                }
            }
        });
    }
};

},{"assert":81}],57:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

},{"assert":81}],58:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var defaultOperators = _dereq_('../utils').unaryOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceAfterPrefixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        file.iterateNodesByType(['UnaryExpression', 'UpdateExpression'], function(node) {
            // Check "node.prefix" for prefix type of (inc|dec)rement
            if (node.prefix && operatorIndex[node.operator]) {
                var argument = node.argument.type;
                var operatorTokenIndex = file.getTokenPosByRangeStart(node.range[0]);
                var operatorToken = tokens[operatorTokenIndex];
                var nextToken = tokens[operatorTokenIndex + 1];

                // Do not report consecutive operators (#405)
                if (
                    argument === 'UnaryExpression' || argument === 'UpdateExpression' &&
                    nextToken.value !== '('
                ) {
                    return;
                }

                if (operatorToken.range[1] === nextToken.range[0]) {
                    errors.add('Operator ' + node.operator + ' should not stick to operand', node.loc.start);
                }
            }
        });
    }
};

},{"../utils":80,"assert":81}],59:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');
var allOperators = _dereq_('../../lib/utils').binaryOperators.filter(function(operator) {
    return operator !== ',';
});

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireSpaceBeforeBinaryOperators option requires array or true value'
        );

        if (isTrue) {
            operators = allOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceBeforeBinaryOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        function errorIfApplicable(token, i, tokens, operator) {
            var prevToken = tokens[i - 1];

            if (prevToken && prevToken.range[1] === token.range[0]) {
                var loc = token.loc.start;

                errors.add(
                    'Operator ' + operator + ' should not stick to preceding expression',
                    loc.line,
                    tokenHelper.getPointerEntities(loc.column, token.value.length)
                );
            }
        }

        // ":" for object property only but not for ternar
        if (operators[':']) {
            file.iterateNodesByType(['ObjectExpression'], function(node) {
                node.properties.forEach(function(prop) {
                    var token = tokenHelper.findOperatorByRangeStart(file, prop.range[0], ':'),
                        tokens = file.getTokens();

                    errorIfApplicable(token, tokens.indexOf(token), tokens, ':');
                });
            });
        }

        // Comma
        if (operators[',']) {
            file.iterateTokensByType('Punctuator', function(token, i, tokens) {
                var operator = token.value;
                if (operator !== ',') {
                    return;
                }

                errorIfApplicable(token, i, tokens, operator);
            });
        }

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'VariableDeclarator', 'LogicalExpression'],
            function(node) {
                var isDec = node.type === 'VariableDeclarator';
                var operator = isDec ? '=' : node.operator;

                if (!operators[operator]) {
                    return;
                }

                var range = (isDec ? node.id : node.left).range[1];
                var part = tokenHelper.getTokenByRangeStartIfPunctuator(file, range, operator);

                if (part) {
                    var loc = part.loc.start;
                    errors.add(
                        'Operator ' + operator + ' should not stick to following expression',
                        loc.line,
                        tokenHelper.getPointerEntities(loc.column, operator.length)
                    );
                }
            }
        );
    }

};

},{"../../lib/utils":80,"../token-helper":78,"assert":81}],60:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpaceBeforeBlockStatements) {
        assert(
            typeof requireSpaceBeforeBlockStatements === 'boolean',
            'requireSpaceBeforeBlockStatements option requires boolean value'
        );
        assert(
            requireSpaceBeforeBlockStatements === true,
            'requireSpaceBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType('BlockStatement', function(node) {
            var tokenBeforeBodyPos = file.getTokenPosByRangeStart(node.range[0] - 1);
            var tokenBeforeBody = tokens[tokenBeforeBodyPos];
            if (tokenBeforeBody) {
                errors.add(
                    'Missing space before opening curly brace for block expressions',
                    tokenBeforeBody.loc.start
                );
            }
        });
    }

};

},{"assert":81}],61:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var defaultOperators = _dereq_('../utils').incrementAndDecrementOperators;

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            this.getOptionName() + ' option requires array or true value'
        );

        if (isTrue) {
            operators = defaultOperators;
        }

        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpaceBeforePostfixUnaryOperators';
    },

    check: function(file, errors) {
        var operatorIndex = this._operatorIndex;
        var tokens = file.getTokens();

        // 'UpdateExpression' involve only ++ and -- operators
        file.iterateNodesByType('UpdateExpression', function(node) {
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

},{"../utils":80,"assert":81}],62:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'requireSpacesInAnonymousFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'requireSpacesInAnonymousFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'requireSpacesInAnonymousFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'requireSpacesInAnonymousFunctionExpression must have beforeOpeningCurlyBrace ' +
            ' or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'requireSpacesInAnonymousFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionExpression'], function(node) {
            var parent = node.parentNode;

            // Ignore syntactic sugar for getters and setters.
            if (parent.type === 'Property' && (parent.kind === 'get' || parent.kind === 'set')) {
                return;
            }

            if (!node.id) {

                if (beforeOpeningRoundBrace) {
                    var nodeBeforeRoundBrace = node;

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
            }
        });
    }

};

},{"assert":81}],63:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        var validProperties = [
            'afterTest',
            'beforeConsequent',
            'afterConsequent',
            'beforeAlternate'
        ];
        var optionName = this.getOptionName();

        if (options === true) {
            options = {
                'afterTest': true,
                'beforeConsequent': true,
                'afterConsequent': true,
                'beforeAlternate': true
            };
        }

        assert(
            typeof options === 'object',
            optionName + ' option must be an object or boolean true'
        );

        var isProperlyConfigured = validProperties.some(function(key) {
            var isPresent = key in options;

            if (isPresent) {
                assert(
                    options[key] === true,
                    optionName + '.' + key + ' property requires true value or should be removed'
                );
            }

            return isPresent;
        });

        assert(
            isProperlyConfigured,
            optionName + ' must have at least 1 of the following properties: ' + validProperties.join(', ')
        );

        validProperties.forEach(function(property) {
            this['_' + property] = Boolean(options[property]);
        }.bind(this));
    },

    getOptionName: function() {
        return 'requireSpacesInConditionalExpression';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();

        file.iterateNodesByType(['ConditionalExpression'], function(node) {
            var test = node.test;
            var consequent = node.consequent;
            var alternate = node.alternate;
            var questionMark;
            var colon;

            if (this._afterTest) {
                questionMark = tokens[file.getTokenPosByRangeStart(test.range[1])];
                if (questionMark && questionMark.value === '?') {
                    errors.add(
                        'Missing space after test',
                        test.loc.end
                    );
                }
            }

            if (this._beforeConsequent) {
                questionMark = tokens[file.getTokenPosByRangeStart(consequent.range[0] - 1)];
                if (questionMark && questionMark.value === '?') {
                    errors.add(
                        'Missing space before consequent',
                        consequent.loc.start
                    );
                }
            }

            if (this._afterConsequent) {
                colon = tokens[file.getTokenPosByRangeStart(consequent.range[1])];
                if (colon && colon.value === ':') {
                    errors.add(
                        'Missing space after consequent',
                        consequent.loc.end
                    );
                }
            }

            if (this._beforeAlternate) {
                colon = tokens[file.getTokenPosByRangeStart(alternate.range[0] - 1)];
                if (colon && colon.value === ':') {
                    errors.add(
                        'Missing space before alternate',
                        alternate.loc.start
                    );
                }
            }
        }.bind(this));
    }

};

},{"assert":81}],64:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'requireSpacesInFunctionDeclaration option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'requireSpacesInFunctionDeclaration.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'requireSpacesInFunctionDeclaration.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'requireSpacesInFunctionDeclaration must have beforeOpeningCurlyBrace or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'requireSpacesInFunctionDeclaration';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionDeclaration'], function(node) {

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

},{"assert":81}],65:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
        return 'requireSpacesInFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var parent = node.parentNode;

            // Ignore syntactic sugar for getters and setters.
            if (parent.type === 'Property' && (parent.kind === 'get' || parent.kind === 'set')) {
                return;
            }

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

},{"assert":81}],66:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'requireSpacesInNamedFunctionExpression option must be the object'
        );

        if ('beforeOpeningRoundBrace' in options) {
            assert(
                options.beforeOpeningRoundBrace === true,
                'requireSpacesInNamedFunctionExpression.beforeOpeningRoundBrace ' +
                'property requires true value or should be removed'
            );
        }

        if ('beforeOpeningCurlyBrace' in options) {
            assert(
                options.beforeOpeningCurlyBrace === true,
                'requireSpacesInNamedFunctionExpression.beforeOpeningCurlyBrace ' +
                'property requires true value or should be removed'
            );
        }

        assert(
            options.beforeOpeningCurlyBrace || options.beforeOpeningRoundBrace,
            'requireSpacesInNamedFunctionExpression must have beforeOpeningCurlyBrace ' +
            'or beforeOpeningRoundBrace property'
        );

        this._beforeOpeningRoundBrace = Boolean(options.beforeOpeningRoundBrace);
        this._beforeOpeningCurlyBrace = Boolean(options.beforeOpeningCurlyBrace);
    },

    getOptionName: function() {
        return 'requireSpacesInNamedFunctionExpression';
    },

    check: function(file, errors) {
        var beforeOpeningRoundBrace = this._beforeOpeningRoundBrace;
        var beforeOpeningCurlyBrace = this._beforeOpeningCurlyBrace;
        var tokens = file.getTokens();

        file.iterateNodesByType(['FunctionExpression'], function(node) {

            if (node.id) {

                if (beforeOpeningRoundBrace) {
                    var nodeBeforeRoundBrace = node.id;

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
            }
        });
    }

};

},{"assert":81}],67:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

},{"assert":81}],68:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

            if (closingBracket.range[0] === prevToken.range[1] && !isNested) {
                errors.add('Missing space before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};

},{"assert":81}],69:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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
            'requireSpacesInsideParentheses option requires string value \'all\' or \'allButNested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var mode = this._mode;

        function isComment(position) {
            return file.getComments().some(function(comment) {
                return position >= comment.range[0] && position < comment.range[1];
            });
        }

        // Iterate punctuators since '(', ')' can exist in multiple contexts.
        file.iterateTokensByType('Punctuator', function(token, index, tokens) {
            if (token.value === '(') {
                var nextToken = tokens[index + 1];

                // Skip the cases where we allow no space even if spaces are required.
                if (nextToken.type === 'Punctuator' && nextToken.value === ')') {
                    return;
                }

                if (mode === 'allButNested' && nextToken.type === 'Punctuator' &&
                    nextToken.value === '(') {
                    return;
                }

                if ((token.range[1] === nextToken.range[0] &&
                        token.loc.end.line === nextToken.loc.start.line) ||
                        isComment(token.range[1])) {
                    errors.add('Missing space after opening round bracket', token.loc.end);
                }
            }

            if (token.value === ')') {
                var prevToken = tokens[index - 1];

                // Skip the cases where we allow no space even if spaces are required.
                if (prevToken.type === 'Punctuator' && prevToken.value === '(') {
                    return;
                }

                if (mode === 'allButNested' && prevToken.type === 'Punctuator' &&
                    prevToken.value === ')') {
                    return;
                }

                if ((token.range[0] === prevToken.range[1] &&
                        token.loc.end.line === prevToken.loc.start.line) ||
                        isComment(token.range[0] - 1)) {
                    errors.add('Missing space before closing round bracket',
                        token.loc.end.line,
                        token.loc.end.column - 2);
                }
            }
        });
    }
};

},{"assert":81}],70:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var tokenHelper = _dereq_('../token-helper');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireTrailingComma) {
        if (typeof requireTrailingComma === 'object') {
            assert(
                requireTrailingComma.ignoreSingleValue === true,
                'requireTrailingComma option skipSingleValue requires true value or should be removed'
            );

            this._ignoreSingleValue = true;
        } else {
            assert(
                requireTrailingComma === true,
                'requireTrailingComma option requires true value or should be removed'
            );
        }
    },

    getOptionName: function() {
        return 'requireTrailingComma';
    },

    check: function(file, errors) {
        var _this = this;

        file.iterateNodesByType(['ObjectExpression', 'ArrayExpression'], function(node) {
            var isObject = node.type === 'ObjectExpression';
            var message = 'Missing comma before closing ' + (isObject ? ' curly brace' : ' bracket');
            var entities = isObject ? node.properties : node.elements;
            var last;
            var hasTrailingComma;

            if (entities.length) {
                if (_this._ignoreSingleValue && entities.length === 1) {
                    return;
                }

                last = entities[entities.length - 1];
                hasTrailingComma = tokenHelper.getTokenByRangeStartIfPunctuator(file, last.range[1], ',');

                if (!hasTrailingComma) {
                    errors.add(message, node.loc.end);
                }
            }
        });
    }

};

},{"../token-helper":78,"assert":81}],71:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireYodaConditions) {
        assert(
            typeof requireYodaConditions === 'boolean',
            'requireYodaConditions option requires boolean value'
        );
        assert(
            requireYodaConditions === true,
            'requireYodaConditions option requires true value or should be removed'
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

    getOptionName: function() {
        return 'requireYodaConditions';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;
        file.iterateNodesByType('BinaryExpression', function(node) {
            if (operators[node.operator]) {
                if (node.right.type === 'Literal' ||
                    (node.right.type === 'Identifier' && node.right.name === 'undefined')
                ) {
                    errors.add('Not yoda condition', node.left.loc.start);
                }
            }
        });
    }

};

},{"assert":81}],72:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keywords) {
        assert(
            typeof keywords === 'string' ||
            typeof Array.isArray(keywords),
            'safeContextKeyword option requires string or array value'
        );

        this._keywords = keywords;
    },

    getOptionName: function() {
        return 'safeContextKeyword';
    },

    check: function(file, errors) {
        var keywords = typeof this._keywords === 'string' ? [this._keywords] : this._keywords;

        // var that = this
        file.iterateNodesByType('VariableDeclaration', function(node) {
            for (var i = 0; i < node.declarations.length; i++) {
                var decl = node.declarations[i];

                // decl.init === null in case of "var foo;"
                if (decl.init &&
                    (decl.init.type === 'ThisExpression' && checkKeywords(decl.id.name, keywords))
                ) {
                    errors.add(
                        'You should use "' + keywords.join('" or "') + '" to save a reference to "this"',
                        node.loc.start
                    );
                }
            }
        });

        // that = this
        file.iterateNodesByType('AssignmentExpression', function(node) {

            if (
                // filter property assignments "foo.bar = this"
                node.left.type === 'Identifier' &&
                (node.right.type === 'ThisExpression' && checkKeywords(node.left.name, keywords))
            ) {
                errors.add(
                    'You should use "' + keywords.join('" or "') + '" to save a reference to "this"',
                    node.loc.start
                );
            }
        });
    }
};

/**
 * Check if at least one keyword equals to passed name
 * @param {String} name
 * @param {Array} keywords
 * @return {Boolean}
 */
function checkKeywords(name, keywords) {
    for (var i = 0; i < keywords.length; i++) {
        if (name === keywords[i]) {
            return false;
        }
    }

    return true;
}

},{"assert":81}],73:[function(_dereq_,module,exports){
var assert = _dereq_('assert');
var commentHelper = _dereq_('../comment-helper');

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
            Program: 'body',
            ObjectExpression: 'properties',
            ArrayExpression: 'elements',
            SwitchStatement: 'cases',
            SwitchCase: 'consequent'
        };
    },

    getOptionName: function() {
        return 'validateIndentation';
    },

    check: function(file, errors) {
        function isMultiline(node) {
            return node.loc.start.line !== node.loc.end.line;
        }

        function getIndentationFromLine(i) {
            var rNotIndentChar = new RegExp('[^' + indentChar + ']');
            var firstContent = Math.max(lines[i].search(rNotIndentChar), 0);
            return firstContent;
        }

        function markPop(node, indents, popAfter) {
            var loc = node.loc;
            if (popAfter) {
                linesToCheck[loc.end.line - 1].popAfter = true;
            } else {
                linesToCheck[loc.end.line - 1].pop = indents;
            }
        }

        function markPushAndCheck(pushNode, indents) {
            linesToCheck[pushNode.loc.start.line - 1].push = indents;
            linesToCheck[pushNode.loc.end.line - 1].check = true;
        }

        function markChildren(node) {
            var childrenProperty = indentableNodes[node.type],
                children = node[childrenProperty];

            children.forEach(function(childNode, i) {
                /* temporary fix for holes in arrays: https://github.com/ariya/esprima/pull/241 */
                if (childNode === null) {
                    var leftLine, rightLine, j;
                    for (j = i - 1; j >= 0; j -= 1) {
                        if (children[j]) {
                            leftLine = children[j].loc.end.line;
                            break;
                        }
                    }
                    for (j = i + 1; j < children.length; j += 1) {
                        if (children[j]) {
                            rightLine = children[j].loc.start.line;
                            break;
                        }
                    }
                    leftLine = leftLine || node.loc.start.line;
                    rightLine = rightLine || node.loc.end.line;
                    for (j = leftLine; j < rightLine; j++) {
                        linesToCheck[j - 1].check = lines[j - 1].replace(/[\s\t]/g, '').length > 0;
                    }
                    return;
                }
                /* /fix */
                if (childNode.loc.start.line !== node.loc.start.line) {
                    linesToCheck[childNode.loc.start.line - 1].check = true;
                }
            });
        }

        function checkIndentations() {
            linesToCheck.forEach(function(line, i) {
                var expectedIndentation;
                var actualIndentation = getIndentationFromLine(i);

                if (line.pop !== null) {
                    expectedIndentation = indentStack.pop() - (indentSize * line.pop);
                } else {
                    expectedIndentation = indentStack[indentStack.length - 1];
                }
                if (line.check) {
                    if (actualIndentation !== expectedIndentation) {
                        errors.add(
                            'Expected indentation of ' + expectedIndentation + ' characters',
                            i + 1,
                            expectedIndentation
                        );
                        // correct the indentation so that future lines
                        // can be validated appropriately
                        actualIndentation = expectedIndentation;
                    }
                }

                if (line.popAfter) {
                    indentStack.pop();
                }

                if (line.push !== null) {
                    indentStack.push(actualIndentation + (indentSize * line.push));
                }
            });
        }

        function checkAlternateBlockStatement(node, property) {
            var child =  node[property];
            if (child && child.type === 'BlockStatement') {
                linesToCheck[child.loc.start.line - 1].push = 1;
                linesToCheck[child.loc.start.line - 1].check = true;
            }
        }

        function generateIndentations() {
            file.iterateNodesByType([
                'Program'
            ], function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                markChildren(node);
            });

            file.iterateNodesByType([
                'ObjectExpression',
                'ArrayExpression'
            ], function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                markChildren(node);
                markPop(node, 1);
                markPushAndCheck(node, 1);
            });

            file.iterateNodesByType('BlockStatement', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                markChildren(node);
                markPop(node, 1);

                // The parent of an else block statement is the entire if/else
                // block. In order to avoid over indenting in the case of a
                // non-block if with a block else, mark push where the else starts,
                // not where the if starts!
                if (node.parentNode.type === 'IfStatement' &&
                    node.parentNode.alternate === node) {
                    markPushAndCheck(node, 1);
                } else {
                    markPushAndCheck(node.parentNode, 1);
                }
            });

            file.iterateNodesByType('IfStatement', function(node) {
                checkAlternateBlockStatement(node, 'alternate');

                var test = node.test,
                    endLine = test.loc.end.line - 1;

                if (isMultiline(test) && linesToCheck[endLine].pop !== null) {
                    linesToCheck[endLine].push = 1;
                }

            });

            file.iterateNodesByType('TryStatement', function(node) {
                checkAlternateBlockStatement(node, 'handler');
                checkAlternateBlockStatement(node, 'finalizer');
            });

            file.iterateNodesByType('SwitchStatement', function(node) {
                if (!isMultiline(node)) {
                    return;
                }
                var indents = 1;

                var childrenProperty = indentableNodes[node.type];
                var children = node[childrenProperty];

                if (children.length > 0 &&
                    node.loc.start.column === children[0].loc.start.column) {
                    indents = 0;
                }

                markChildren(node);
                markPop(node, indents);
                markPushAndCheck(node, indents);
            });

            file.iterateNodesByType('SwitchCase', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                var childrenProperty = indentableNodes[node.type];
                var children = node[childrenProperty];

                if (children.length > 1 ||
                    (children[0] && children[0].type !== 'BlockStatement')) {
                    markChildren(node);
                    markPop(node, 1, true);
                    markPushAndCheck(node, 1);
                } else if (children.length === 0) {
                    linesToCheck[node.loc.start.line - 1].push = 1;
                    linesToCheck[node.loc.start.line - 1].check = true;
                    markPop(node, 1, true);
                }
            });

            file.iterateNodesByType('VariableDeclaration', function(node) {
                var startLine = node.loc.start.line - 1;
                var decls = node.declarations;
                var declStartLine = decls[0].loc.start.line - 1;
                var actualIndents;
                var newIndents;

                if (startLine !== declStartLine) {
                    return;
                }

                if (linesToCheck[startLine].push !== null) {
                    actualIndents = getIndentationFromLine(startLine);

                    if (decls.length > 1) {
                        newIndents = getIndentationFromLine(decls[1].loc.start.line - 1);
                    } else {
                        newIndents = getIndentationFromLine(decls[0].loc.end.line - 1);
                    }
                    linesToCheck[startLine].push = ((newIndents - actualIndents) / indentSize) + 1;
                }
            });
        }

        var indentableNodes = this._indentableNodes;
        var indentChar = this._indentChar;
        var indentSize = this._indentSize;

        var lines = commentHelper.getLinesWithCommentsRemoved(file, errors);
        var indentStack = [0];
        var linesToCheck = lines.map(function() {
            return {
                push: null,
                pop: null,
                popAfter: null,
                check: null
            };
        });

        generateIndentations();
        checkIndentations();
    }

};

},{"../comment-helper":1,"assert":81}],74:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(typeof options === 'object', 'validateJSDoc option requires object value');
        this._options = options;
    },

    getOptionName: function() {
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

},{"assert":81}],75:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

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

    getOptionName: function() {
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

},{"assert":81}],76:[function(_dereq_,module,exports){
var assert = _dereq_('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(quoteMark) {
        this._allowEscape = false;

        if (typeof quoteMark === 'object') {
            assert(
                typeof quoteMark.escape === 'boolean' && quoteMark.mark !== undefined,
                'validateQuoteMarks option requires the "escape" and "mark" property to be defined'
            );
            this._allowEscape = quoteMark.escape;
            quoteMark = quoteMark.mark;
        }

        assert(
            quoteMark === '"' || quoteMark === '\'' || quoteMark === true,
            'validateQuoteMarks option requires \'"\', "\'", or boolean true'
        );

        this._quoteMark = quoteMark;
    },

    getOptionName: function() {
        return 'validateQuoteMarks';
    },

    check: function(file, errors) {
        var quoteMark = this._quoteMark;
        var allowEscape = this._allowEscape;
        var opposite = {
            '"': '\'',
            '\'': '"'
        };

        file.iterateTokensByType('String', function(token) {
            var str = token.value;
            var mark = str[0];
            var stripped = str.substring(1, str.length - 1);

            if (quoteMark === true) {
                quoteMark = mark;
            }

            if (mark !== quoteMark) {
                if (allowEscape && stripped.indexOf(opposite[mark]) > -1) {
                    return;
                }

                errors.add(
                    'Invalid quote mark found',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};

},{"assert":81}],77:[function(_dereq_,module,exports){
var esprima = _dereq_('esprima');
var Errors = _dereq_('./errors');
var JsFile = _dereq_('./js-file');
var preset = _dereq_('./options/preset');

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
        this.registerRule(new (_dereq_('./rules/require-curly-braces'))());
        this.registerRule(new (_dereq_('./rules/require-multiple-var-decl'))());
        this.registerRule(new (_dereq_('./rules/disallow-multiple-var-decl'))());
        this.registerRule(new (_dereq_('./rules/disallow-empty-blocks'))());
        this.registerRule(new (_dereq_('./rules/require-space-after-keywords'))());
        this.registerRule(new (_dereq_('./rules/disallow-space-after-keywords'))());
        this.registerRule(new (_dereq_('./rules/require-parentheses-around-iife'))());

        /* deprecated rules */
        this.registerRule(new (_dereq_('./rules/require-left-sticked-operators'))());
        this.registerRule(new (_dereq_('./rules/disallow-left-sticked-operators'))());
        this.registerRule(new (_dereq_('./rules/require-right-sticked-operators'))());
        this.registerRule(new (_dereq_('./rules/disallow-right-sticked-operators'))());
        /* deprecated rules (end) */

        this.registerRule(new (_dereq_('./rules/require-operator-before-line-break'))());
        this.registerRule(new (_dereq_('./rules/disallow-implicit-type-conversion'))());
        this.registerRule(new (_dereq_('./rules/require-camelcase-or-uppercase-identifiers'))());
        this.registerRule(new (_dereq_('./rules/disallow-keywords'))());
        this.registerRule(new (_dereq_('./rules/disallow-multiple-line-breaks'))());
        this.registerRule(new (_dereq_('./rules/disallow-multiple-line-strings'))());
        this.registerRule(new (_dereq_('./rules/validate-line-breaks'))());
        this.registerRule(new (_dereq_('./rules/validate-quote-marks'))());
        this.registerRule(new (_dereq_('./rules/validate-indentation'))());
        this.registerRule(new (_dereq_('./rules/disallow-trailing-whitespace'))());
        this.registerRule(new (_dereq_('./rules/disallow-mixed-spaces-and-tabs'))());
        this.registerRule(new (_dereq_('./rules/require-keywords-on-new-line'))());
        this.registerRule(new (_dereq_('./rules/disallow-keywords-on-new-line'))());
        this.registerRule(new (_dereq_('./rules/require-line-feed-at-file-end'))());
        this.registerRule(new (_dereq_('./rules/maximum-line-length'))());
        this.registerRule(new (_dereq_('./rules/validate-jsdoc'))());
        this.registerRule(new (_dereq_('./rules/require-yoda-conditions'))());
        this.registerRule(new (_dereq_('./rules/disallow-yoda-conditions'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-inside-object-brackets'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-inside-array-brackets'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-inside-parentheses'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-inside-object-brackets'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-inside-array-brackets'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-inside-parentheses'))());
        this.registerRule(new (_dereq_('./rules/require-blocks-on-newline'))());
        this.registerRule(new (_dereq_('./rules/require-space-after-object-keys'))());
        this.registerRule(new (_dereq_('./rules/disallow-space-after-object-keys'))());
        this.registerRule(new (_dereq_('./rules/disallow-quoted-keys-in-objects'))());
        this.registerRule(new (_dereq_('./rules/disallow-dangling-underscores'))());
        this.registerRule(new (_dereq_('./rules/require-aligned-object-values'))());

        this.registerRule(new (_dereq_('./rules/disallow-padding-newlines-in-blocks'))());
        this.registerRule(new (_dereq_('./rules/require-padding-newlines-in-blocks'))());

        this.registerRule(new (_dereq_('./rules/disallow-trailing-comma'))());
        this.registerRule(new (_dereq_('./rules/require-trailing-comma'))());

        this.registerRule(new (_dereq_('./rules/disallow-comma-before-line-break'))());
        this.registerRule(new (_dereq_('./rules/require-comma-before-line-break'))());

        this.registerRule(new (_dereq_('./rules/disallow-space-before-block-statements.js'))());
        this.registerRule(new (_dereq_('./rules/require-space-before-block-statements.js'))());

        this.registerRule(new (_dereq_('./rules/disallow-space-before-postfix-unary-operators.js'))());
        this.registerRule(new (_dereq_('./rules/require-space-before-postfix-unary-operators.js'))());

        this.registerRule(new (_dereq_('./rules/disallow-space-after-prefix-unary-operators.js'))());
        this.registerRule(new (_dereq_('./rules/require-space-after-prefix-unary-operators.js'))());

        this.registerRule(new (_dereq_('./rules/disallow-space-before-binary-operators'))());
        this.registerRule(new (_dereq_('./rules/require-space-before-binary-operators'))());

        this.registerRule(new (_dereq_('./rules/disallow-space-after-binary-operators'))());
        this.registerRule(new (_dereq_('./rules/require-space-after-binary-operators'))());

        this.registerRule(new (_dereq_('./rules/require-spaces-in-conditional-expression'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-in-conditional-expression'))());

        this.registerRule(new (_dereq_('./rules/require-spaces-in-function-expression'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-in-function-expression'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-in-anonymous-function-expression'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-in-anonymous-function-expression'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-in-named-function-expression'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-in-named-function-expression'))());
        this.registerRule(new (_dereq_('./rules/require-spaces-in-function-declaration'))());
        this.registerRule(new (_dereq_('./rules/disallow-spaces-in-function-declaration'))());

        this.registerRule(new (_dereq_('./rules/require-capitalized-constructors'))());

        this.registerRule(new (_dereq_('./rules/safe-context-keyword'))());

        this.registerRule(new (_dereq_('./rules/require-dot-notation'))());

        this.registerRule(new (_dereq_('./rules/require-space-after-line-comment'))());
        this.registerRule(new (_dereq_('./rules/disallow-space-after-line-comment'))());
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

        if (config.preset && !preset.exists(config.preset)) {
            throw new Error(preset.getDoesNotExistError(config.preset));
        }

        preset.extend(config);

        var configRules = Object.keys(config);
        var activeRules = this._activeRules;

        this._config = config;
        this._rules.forEach(function(rule) {
            var ruleOptionName = rule.getOptionName();

            if (config.hasOwnProperty(ruleOptionName)) {

                // Do not configure the rule if it's equals to null (#203)
                if (config[ruleOptionName] !== null) {
                    rule.configure(config[ruleOptionName]);
                }
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
     * Checks file provided with a string.
     * @param {String} str
     * @param {String} filename
     * @returns {Errors}
     */
    checkString: function(str, filename) {
        filename = filename || 'input';
        var tree;
        str = str.replace(/^#!?[^\n]+$/gm, '\n');
        try {
            tree = esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
        } catch (e) {
            throw new Error('Syntax error at ' + filename + ': ' + e.message);
        }
        var file = new JsFile(filename, str, tree);
        var errors = new Errors(file);
        this._activeRules.forEach(function(rule) {

            // Do not process the rule if it's equals to null (#203)
            if (this._config[rule.getOptionName()] !== null) {
                errors.setCurrentRule(rule.getOptionName());
                rule.check(file, errors);
            }

        }, this);

        // sort errors list to show errors as they appear in source
        errors.getErrorList().sort(function(a, b) {
            return (a.line - b.line) || (a.column - b.column);
        });

        return errors;
    }
};

module.exports = StringChecker;

},{"./errors":2,"./js-file":3,"./options/preset":4,"./rules/disallow-comma-before-line-break":5,"./rules/disallow-dangling-underscores":6,"./rules/disallow-empty-blocks":7,"./rules/disallow-implicit-type-conversion":8,"./rules/disallow-keywords":10,"./rules/disallow-keywords-on-new-line":9,"./rules/disallow-left-sticked-operators":11,"./rules/disallow-mixed-spaces-and-tabs":12,"./rules/disallow-multiple-line-breaks":13,"./rules/disallow-multiple-line-strings":14,"./rules/disallow-multiple-var-decl":15,"./rules/disallow-padding-newlines-in-blocks":16,"./rules/disallow-quoted-keys-in-objects":17,"./rules/disallow-right-sticked-operators":18,"./rules/disallow-space-after-binary-operators":19,"./rules/disallow-space-after-keywords":20,"./rules/disallow-space-after-line-comment":21,"./rules/disallow-space-after-object-keys":22,"./rules/disallow-space-after-prefix-unary-operators.js":23,"./rules/disallow-space-before-binary-operators":24,"./rules/disallow-space-before-block-statements.js":25,"./rules/disallow-space-before-postfix-unary-operators.js":26,"./rules/disallow-spaces-in-anonymous-function-expression":27,"./rules/disallow-spaces-in-conditional-expression":28,"./rules/disallow-spaces-in-function-declaration":29,"./rules/disallow-spaces-in-function-expression":30,"./rules/disallow-spaces-in-named-function-expression":31,"./rules/disallow-spaces-inside-array-brackets":32,"./rules/disallow-spaces-inside-object-brackets":33,"./rules/disallow-spaces-inside-parentheses":34,"./rules/disallow-trailing-comma":35,"./rules/disallow-trailing-whitespace":36,"./rules/disallow-yoda-conditions":37,"./rules/maximum-line-length":38,"./rules/require-aligned-object-values":39,"./rules/require-blocks-on-newline":40,"./rules/require-camelcase-or-uppercase-identifiers":41,"./rules/require-capitalized-constructors":42,"./rules/require-comma-before-line-break":43,"./rules/require-curly-braces":44,"./rules/require-dot-notation":45,"./rules/require-keywords-on-new-line":46,"./rules/require-left-sticked-operators":47,"./rules/require-line-feed-at-file-end":48,"./rules/require-multiple-var-decl":49,"./rules/require-operator-before-line-break":50,"./rules/require-padding-newlines-in-blocks":51,"./rules/require-parentheses-around-iife":52,"./rules/require-right-sticked-operators":53,"./rules/require-space-after-binary-operators":54,"./rules/require-space-after-keywords":55,"./rules/require-space-after-line-comment":56,"./rules/require-space-after-object-keys":57,"./rules/require-space-after-prefix-unary-operators.js":58,"./rules/require-space-before-binary-operators":59,"./rules/require-space-before-block-statements.js":60,"./rules/require-space-before-postfix-unary-operators.js":61,"./rules/require-spaces-in-anonymous-function-expression":62,"./rules/require-spaces-in-conditional-expression":63,"./rules/require-spaces-in-function-declaration":64,"./rules/require-spaces-in-function-expression":65,"./rules/require-spaces-in-named-function-expression":66,"./rules/require-spaces-inside-array-brackets":67,"./rules/require-spaces-inside-object-brackets":68,"./rules/require-spaces-inside-parentheses":69,"./rules/require-trailing-comma":70,"./rules/require-yoda-conditions":71,"./rules/safe-context-keyword":72,"./rules/validate-indentation":73,"./rules/validate-jsdoc":74,"./rules/validate-line-breaks":75,"./rules/validate-quote-marks":76,"esprima":89}],78:[function(_dereq_,module,exports){
/**
 * Returns token by range start. Ignores ()
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.getTokenByRangeStart = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // if token is ")" -> get next token
    // for example (a) + (b)
    // next token ---^
    // we should find (a) + (b)
    // ------------------^
    if (this.isTokenParenthesis(file, range, backward)) {
        var pos = backward ? token.range[0] - 1 : token.range[1];
        tokenPos = file.getTokenPosByRangeStart(pos);
        token = tokens[tokenPos];
    }

    return token || null;
};

/**
 * Is next/previous token a parentheses?
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {Boolean} [backward=false] Direction
 * @returns {Boolean}
 */
exports.isTokenParenthesis = function(file, range, backward) {
    var tokens = file.getTokens();

    // get next token
    var tokenPos = file.getTokenPosByRangeStart(range);
    var token = tokens[tokenPos];

    // we should check for "(" if we go backward
    var parenthesis = backward ? '(' : ')';

    return token && token.type === 'Punctuator' && token.value === parenthesis;
};

/**
 * Returns true if token is punctuator
 *
 * @param {Object} token
 * @param {String} punctuator
 * @returns {Boolean}
 */
exports.tokenIsPunctuator = function(token, punctuator) {
    return token && token.type === 'Punctuator' && token.value === punctuator;
};

/**
 * Find next/previous operator by range start
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {String} operator
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.findOperatorByRangeStart = function(file, range, operator, backward) {
    var tokens = file.getTokens();
    var index = file.getTokenPosByRangeStart(range);

    while (tokens[ index ]) {
        if (tokens[ index ].value === operator) {
            return tokens[ index ];
        }

        if (backward) {
            index--;
        } else {
            index++;
        }
    }

    return null;
};

/**
 * Returns token or false if there is a punctuator in a given range
 *
 * @param {JsFile} file
 * @param {Number} range
 * @param {String} operator
 * @param {Boolean} [backward=false] Direction
 * @returns {Object|null}
 */
exports.getTokenByRangeStartIfPunctuator = function(file, range, operator, backward) {
    var part = this.getTokenByRangeStart(file, range, backward);

    if (this.tokenIsPunctuator(part, operator)) {
        return part;
    }

    return null;
};

/**
 * Get column for long entities
 * @param {Number} column
 * @param {Number} length
 * @return {Number}
 */
exports.getPointerEntities = function(column, length) {
    return column - 1 + Math.ceil(length / 2);
};

},{}],79:[function(_dereq_,module,exports){
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
    if (cb(node, parentNode, parentCollection) === false) {
        return;
    }

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
                        iterate(contents, cb, node, [contents]);
                    }
                }
            }
        }
    }
}

},{}],80:[function(_dereq_,module,exports){
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
    'null': true,
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

/**
 * All possible binary operators supported by JSCS
 * @type {Array}
 */
exports.binaryOperators = [

    // assignment operators
    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
    '&=', '|=', '^=',

    '+', '-', '*', '/', '%', '<<', '>>', '>>>', '&',
    '|', '^', '&&', '||', '===', '==', '>=',
    '<=', '<', '>', '!=', '!==',

    ',', ':'
];

/**
 * Increment and decrement operators
 * @type {Array}
 */
exports.incrementAndDecrementOperators = ['++', '--'];

/**
 * All possible unary operators supported by JSCS
 * @type {Array}
 */
exports.unaryOperators = ['-', '+', '!', '~'].concat(exports.incrementAndDecrementOperators);

/**
 * All possible operators support by JSCS
 * @type {Array}
 */
exports.operators = exports.binaryOperators.concat(exports.unaryOperators);

},{}],81:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

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
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
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
    var ka = objectKeys(a),
        kb = objectKeys(b),
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

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":83}],82:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],83:[function(_dereq_,module,exports){
(function (process,global){
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


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
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

  array.forEach(function(val, idx) {
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
    var ret = value.inspect(recurseTimes, ctx);
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
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
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
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
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
    if (ctx.seen.indexOf(desc.value) < 0) {
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
  var length = output.reduce(function(prev, cur) {
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
  return Array.isArray(ar);
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
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
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

exports.isBuffer = _dereq_('./support/isBuffer');

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
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":82,"FWaASH":85,"inherits":84}],84:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],85:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],86:[function(_dereq_,module,exports){
module.exports=_dereq_(82)
},{}],87:[function(_dereq_,module,exports){
module.exports=_dereq_(83)
},{"./support/isBuffer":86,"FWaASH":85,"inherits":84}],88:[function(_dereq_,module,exports){
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
  exports[color] = function (str) {
    return func.apply(str);
  };
  String.prototype.__defineGetter__(color, func);
};

function stylize(str, style) {

  var styles;

  if (exports.mode === 'console') {
    styles = {
      //styles
      'bold'      : ['\x1B[1m',  '\x1B[22m'],
      'italic'    : ['\x1B[3m',  '\x1B[23m'],
      'underline' : ['\x1B[4m',  '\x1B[24m'],
      'inverse'   : ['\x1B[7m',  '\x1B[27m'],
      'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
      //text colors
      //grayscale
      'white'     : ['\x1B[37m', '\x1B[39m'],
      'grey'      : ['\x1B[90m', '\x1B[39m'],
      'black'     : ['\x1B[30m', '\x1B[39m'],
      //colors
      'blue'      : ['\x1B[34m', '\x1B[39m'],
      'cyan'      : ['\x1B[36m', '\x1B[39m'],
      'green'     : ['\x1B[32m', '\x1B[39m'],
      'magenta'   : ['\x1B[35m', '\x1B[39m'],
      'red'       : ['\x1B[31m', '\x1B[39m'],
      'yellow'    : ['\x1B[33m', '\x1B[39m'],
      //background colors
      //grayscale
      'whiteBG'     : ['\x1B[47m', '\x1B[49m'],
      'greyBG'      : ['\x1B[49;5;8m', '\x1B[49m'],
      'blackBG'     : ['\x1B[40m', '\x1B[49m'],
      //colors
      'blueBG'      : ['\x1B[44m', '\x1B[49m'],
      'cyanBG'      : ['\x1B[46m', '\x1B[49m'],
      'greenBG'     : ['\x1B[42m', '\x1B[49m'],
      'magentaBG'   : ['\x1B[45m', '\x1B[49m'],
      'redBG'       : ['\x1B[41m', '\x1B[49m'],
      'yellowBG'    : ['\x1B[43m', '\x1B[49m']
    };
  } else if (exports.mode === 'browser') {
    styles = {
      //styles
      'bold'      : ['<b>',  '</b>'],
      'italic'    : ['<i>',  '</i>'],
      'underline' : ['<u>',  '</u>'],
      'inverse'   : ['<span style="background-color:black;color:white;">',  '</span>'],
      'strikethrough' : ['<del>',  '</del>'],
      //text colors
      //grayscale
      'white'     : ['<span style="color:white;">',   '</span>'],
      'grey'      : ['<span style="color:gray;">',    '</span>'],
      'black'     : ['<span style="color:black;">',   '</span>'],
      //colors
      'blue'      : ['<span style="color:blue;">',    '</span>'],
      'cyan'      : ['<span style="color:cyan;">',    '</span>'],
      'green'     : ['<span style="color:green;">',   '</span>'],
      'magenta'   : ['<span style="color:magenta;">', '</span>'],
      'red'       : ['<span style="color:red;">',     '</span>'],
      'yellow'    : ['<span style="color:yellow;">',  '</span>'],
      //background colors
      //grayscale
      'whiteBG'     : ['<span style="background-color:white;">',   '</span>'],
      'greyBG'      : ['<span style="background-color:gray;">',    '</span>'],
      'blackBG'     : ['<span style="background-color:black;">',   '</span>'],
      //colors
      'blueBG'      : ['<span style="background-color:blue;">',    '</span>'],
      'cyanBG'      : ['<span style="background-color:cyan;">',    '</span>'],
      'greenBG'     : ['<span style="background-color:green;">',   '</span>'],
      'magentaBG'   : ['<span style="background-color:magenta;">', '</span>'],
      'redBG'       : ['<span style="background-color:red;">',     '</span>'],
      'yellowBG'    : ['<span style="background-color:yellow;">',  '</span>']
    };
  } else if (exports.mode === 'none') {
    return str + '';
  } else {
    console.log('unsupported mode, try "browser", "console" or "none"');
  }
  return styles[style][0] + str + styles[style][1];
}

function applyTheme(theme) {

  //
  // Remark: This is a list of methods that exist
  // on String that you should not overwrite.
  //
  var stringPrototypeBlacklist = [
    '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'charAt', 'constructor',
    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf', 'charCodeAt',
    'indexOf', 'lastIndexof', 'length', 'localeCompare', 'match', 'replace', 'search', 'slice', 'split', 'substring',
    'toLocaleLowerCase', 'toLocaleUpperCase', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight'
  ];

  Object.keys(theme).forEach(function (prop) {
    if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
      console.log('warn: '.red + ('String.prototype' + prop).magenta + ' is probably something you don\'t want to override. Ignoring style name');
    }
    else {
      if (typeof(theme[prop]) === 'string') {
        addProperty(prop, function () {
          return exports[theme[prop]](this);
        });
      }
      else {
        addProperty(prop, function () {
          var ret = this;
          for (var t = 0; t < theme[prop].length; t++) {
            ret = exports[theme[prop][t]](ret);
          }
          return ret;
        });
      }
    }
  });
}


//
// Iterate through all default styles and colors
//
var x = ['bold', 'underline', 'strikethrough', 'italic', 'inverse', 'grey', 'black', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta', 'greyBG', 'blackBG', 'yellowBG', 'redBG', 'greenBG', 'blueBG', 'whiteBG', 'cyanBG', 'magentaBG'];
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
    var exploded = this.split(""), i = 0;
    exploded = exploded.map(map);
    return exploded.join("");
  };
}

var rainbowMap = (function () {
  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; //RoY G BiV
  return function (letter, i, exploded) {
    if (letter === " ") {
      return letter;
    } else {
      return stylize(letter, rainbowColors[i++ % rainbowColors.length]);
    }
  };
})();

exports.themes = {};

exports.addSequencer = function (name, map) {
  addProperty(name, sequencer(map));
};

exports.addSequencer('rainbow', rainbowMap);
exports.addSequencer('zebra', function (letter, i, exploded) {
  return i % 2 === 0 ? letter : letter.inverse;
});

exports.setTheme = function (theme) {
  if (typeof theme === 'string') {
    try {
      exports.themes[theme] = _dereq_(theme);
      applyTheme(exports.themes[theme]);
      return exports.themes[theme];
    } catch (err) {
      console.log(err);
      return err;
    }
  } else {
    applyTheme(theme);
  }
};


addProperty('stripColors', function () {
  return ("" + this).replace(/\x1B\[\d+m/g, '');
});

// please no
function zalgo(text, options) {
  var soul = {
    "up" : [
      '̍', '̎', '̄', '̅',
      '̿', '̑', '̆', '̐',
      '͒', '͗', '͑', '̇',
      '̈', '̊', '͂', '̓',
      '̈', '͊', '͋', '͌',
      '̃', '̂', '̌', '͐',
      '̀', '́', '̋', '̏',
      '̒', '̓', '̔', '̽',
      '̉', 'ͣ', 'ͤ', 'ͥ',
      'ͦ', 'ͧ', 'ͨ', 'ͩ',
      'ͪ', 'ͫ', 'ͬ', 'ͭ',
      'ͮ', 'ͯ', '̾', '͛',
      '͆', '̚'
    ],
    "down" : [
      '̖', '̗', '̘', '̙',
      '̜', '̝', '̞', '̟',
      '̠', '̤', '̥', '̦',
      '̩', '̪', '̫', '̬',
      '̭', '̮', '̯', '̰',
      '̱', '̲', '̳', '̹',
      '̺', '̻', '̼', 'ͅ',
      '͇', '͈', '͉', '͍',
      '͎', '͓', '͔', '͕',
      '͖', '͙', '͚', '̣'
    ],
    "mid" : [
      '̕', '̛', '̀', '́',
      '͘', '̡', '̢', '̧',
      '̨', '̴', '̵', '̶',
      '͜', '͝', '͞',
      '͟', '͠', '͢', '̸',
      '̷', '͡', ' ҉'
    ]
  },
  all = [].concat(soul.up, soul.down, soul.mid),
  zalgo = {};

  function randomNumber(range) {
    var r = Math.floor(Math.random() * range);
    return r;
  }

  function is_char(character) {
    var bool = false;
    all.filter(function (i) {
      bool = (i === character);
    });
    return bool;
  }

  function heComes(text, options) {
    var result = '', counts, l;
    options = options || {};
    options["up"] = options["up"] || true;
    options["mid"] = options["mid"] || true;
    options["down"] = options["down"] || true;
    options["size"] = options["size"] || "maxi";
    text = text.split('');
    for (l in text) {
      if (is_char(l)) {
        continue;
      }
      result = result + text[l];
      counts = {"up" : 0, "down" : 0, "mid" : 0};
      switch (options.size) {
      case 'mini':
        counts.up = randomNumber(8);
        counts.min = randomNumber(2);
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
        counts.down = randomNumber(8) + 1;
        break;
      }

      var arr = ["up", "mid", "down"];
      for (var d in arr) {
        var index = arr[d];
        for (var i = 0 ; i <= counts[index]; i++) {
          if (options[index]) {
            result = result + soul[index][randomNumber(soul[index].length)];
          }
        }
      }
    }
    return result;
  }
  return heComes(text);
}


// don't summon zalgo
addProperty('zalgo', function () {
  return zalgo(this);
});

},{}],89:[function(_dereq_,module,exports){
/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2013 Mathias Bynens <mathias@qiwi.be>
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
throwErrorTolerant: true,
throwError: true, generateStatement: true, peek: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseUnaryExpression: true,
parseStatement: true, parseSourceElement: true */

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.

    /* istanbul ignore next */
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
        FnExprTokens,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        SyntaxTreeDelegate,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        length,
        delegate,
        lookahead,
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
        StringLiteral: 8,
        RegularExpression: 9
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
    TokenName[Token.RegularExpression] = 'RegularExpression';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

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
        NonAsciiIdentifierStart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]'),
        NonAsciiIdentifierPart: new RegExp('[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        /* istanbul ignore if */
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
            (ch === 0x5C) ||                      // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    function isStrictModeReservedWord(id) {
        switch (id) {
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
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // 7.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment, attacher;

        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (state.lastCommentStart >= start) {
            return;
        }
        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
        if (extra.attachComment) {
            extra.leadingComments.push(comment);
            extra.trailingComments.push(comment);
        }
    }

    function skipSingleLineComment(offset) {
        var start, loc, ch, comment;

        start = index - offset;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - offset
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                if (extra.comments) {
                    comment = source.slice(start + offset, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + offset, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                ++index;
                lineStart = index;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else if (ch === 0x2A) {
                // Block comment ends with '*/'.
                if (source.charCodeAt(index + 1) === 0x2F) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function skipComment() {
        var ch, start;

        start = (index === 0);
        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                start = true;
            } else if (ch === 0x2F) { // U+002F is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 0x2F) {
                    ++index;
                    ++index;
                    skipSingleLineComment(2);
                    start = true;
                } else if (ch === 0x2A) {  // U+002A is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else if (start && ch === 0x2D) { // U+002D is '-'
                // U+003E is '>'
                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
                    // '-->' is a single-line comment
                    index += 3;
                    skipSingleLineComment(3);
                } else {
                    break;
                }
            } else if (ch === 0x3C) { // U+003C is '<'
                if (source.slice(index + 1, index + 4) === '!--') {
                    ++index; // `<`
                    ++index; // `!`
                    ++index; // `-`
                    ++index; // `-`
                    skipSingleLineComment(4);
                } else {
                    break;
                }
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

    function getEscapedIdentifier() {
        var ch, id;

        ch = source.charCodeAt(index++);
        id = String.fromCharCode(ch);

        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (ch === 0x5C) {
            if (source.charCodeAt(index) !== 0x75) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            id = ch;
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            id += String.fromCharCode(ch);

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (ch === 0x5C) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 0x75) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 0x5C) {
                // Blackslash (U+005C) marks Unicode escape sequence.
                index = start;
                return getEscapedIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (U+005C) starts an escaped character.
        id = (source.charCodeAt(index) === 0x5C) ? getEscapedIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }


    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            code = source.charCodeAt(index),
            code2,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        switch (code) {

        // Check for most common single-character punctuators.
        case 0x2E:  // . dot
        case 0x28:  // ( open bracket
        case 0x29:  // ) close bracket
        case 0x3B:  // ; semicolon
        case 0x2C:  // , comma
        case 0x7B:  // { open curly brace
        case 0x7D:  // } close curly brace
        case 0x5B:  // [
        case 0x5D:  // ]
        case 0x3A:  // :
        case 0x3F:  // ?
        case 0x7E:  // ~
            ++index;
            if (extra.tokenize) {
                if (code === 0x28) {
                    extra.openParenToken = extra.tokens.length;
                } else if (code === 0x7B) {
                    extra.openCurlyToken = extra.tokens.length;
                }
            }
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };

        default:
            code2 = source.charCodeAt(index + 1);

            // '=' (U+003D) marks an assignment or comparison operator.
            if (code2 === 0x3D) {
                switch (code) {
                case 0x2B:  // +
                case 0x2D:  // -
                case 0x2F:  // /
                case 0x3C:  // <
                case 0x3E:  // >
                case 0x5E:  // ^
                case 0x7C:  // |
                case 0x25:  // %
                case 0x26:  // &
                case 0x2A:  // *
                    index += 2;
                    return {
                        type: Token.Punctuator,
                        value: String.fromCharCode(code) + String.fromCharCode(code2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        start: start,
                        end: index
                    };

                case 0x21: // !
                case 0x3D: // =
                    index += 2;

                    // !== and ===
                    if (source.charCodeAt(index) === 0x3D) {
                        ++index;
                    }
                    return {
                        type: Token.Punctuator,
                        value: source.slice(start, index),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        start: start,
                        end: index
                    };
                }
            }
        }

        // 4-character punctuator: >>>=

        ch4 = source.substr(index, 4);

        if (ch4 === '>>>=') {
            index += 4;
            return {
                type: Token.Punctuator,
                value: ch4,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        // 3-character punctuators: === !== >>> <<= >>=

        ch3 = ch4.substr(0, 3);

        if (ch3 === '>>>' || ch3 === '<<=' || ch3 === '>>=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: ch3,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        // Other 2-character punctuators: ++ -- << >> && ||
        ch2 = ch3.substr(0, 2);

        if ((ch1 === ch2[1] && ('+-<>&|'.indexOf(ch1) >= 0)) || ch2 === '=>') {
            index += 2;
            return {
                type: Token.Punctuator,
                value: ch2,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        // 1-character punctuators: < > = ! + - * % & | ^ /
        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    // 7.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanOctalLiteral(start) {
        var number = '0' + source[index++];
        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: true,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
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
                    ++index;
                    return scanHexLiteral(start);
                }
                if (isOctalDigit(ch)) {
                    return scanOctalLiteral(start);
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false, startLineNumber, startLineStart;
        startLineNumber = lineNumber;
        startLineStart = lineStart;

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
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
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
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
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
                    lineStart = index;
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
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
            startLineNumber: startLineNumber,
            startLineStart: startLineStart,
            lineNumber: lineNumber,
            lineStart: lineStart,
            start: start,
            end: index
        };
    }

    function testRegExp(pattern, flags) {
        var value;
        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }
        return value;
    }

    function scanRegExpBody() {
        var ch, str, classMarker, terminated, body;

        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        classMarker = false;
        terminated = false;
        while (index < length) {
            ch = source[index++];
            str += ch;
            if (ch === '\\') {
                ch = source[index++];
                // ECMA-262 7.8.5
                if (isLineTerminator(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
                str += ch;
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                throwError({}, Messages.UnterminatedRegExp);
            } else if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        body = str.substr(1, str.length - 2);
        return {
            value: body,
            literal: str
        };
    }

    function scanRegExpFlags() {
        var ch, str, flags, restore;

        str = '';
        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
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
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
                } else {
                    str += '\\';
                    throwErrorTolerant({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        return {
            value: flags,
            literal: str
        };
    }

    function scanRegExp() {
        var start, body, flags, pattern, value;

        lookahead = null;
        skipComment();
        start = index;

        body = scanRegExpBody();
        flags = scanRegExpFlags();
        value = testRegExp(body.value, flags.value);

        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: start,
                end: index
            };
        }

        return {
            literal: body.literal + flags.literal,
            value: value,
            start: start,
            end: index
        };
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

        regex = scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        /* istanbul ignore next */
        if (!extra.tokenize) {
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
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advanceSlash() {
        var prevToken,
            checkToken;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken = extra.tokens[extra.tokens.length - 1];
        if (!prevToken) {
            // Nothing before that: it cannot be a division.
            return collectRegex();
        }
        if (prevToken.type === 'Punctuator') {
            if (prevToken.value === ']') {
                return scanPunctuator();
            }
            if (prevToken.value === ')') {
                checkToken = extra.tokens[extra.openParenToken - 1];
                if (checkToken &&
                        checkToken.type === 'Keyword' &&
                        (checkToken.value === 'if' ||
                         checkToken.value === 'while' ||
                         checkToken.value === 'for' ||
                         checkToken.value === 'with')) {
                    return collectRegex();
                }
                return scanPunctuator();
            }
            if (prevToken.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra.tokens[extra.openCurlyToken - 3] &&
                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken = extra.tokens[extra.openCurlyToken - 4];
                    if (!checkToken) {
                        return scanPunctuator();
                    }
                } else if (extra.tokens[extra.openCurlyToken - 4] &&
                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken = extra.tokens[extra.openCurlyToken - 5];
                    if (!checkToken) {
                        return collectRegex();
                    }
                } else {
                    return scanPunctuator();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator();
                }
                // It is a declaration.
                return collectRegex();
            }
            return collectRegex();
        }
        if (prevToken.type === 'Keyword') {
            return collectRegex();
        }
        return scanPunctuator();
    }

    function advance() {
        var ch;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                start: index,
                end: index
            };
        }

        ch = source.charCodeAt(index);

        if (isIdentifierStart(ch)) {
            return scanIdentifier();
        }

        // Very common: ( and ) and ;
        if (ch === 0x28 || ch === 0x29 || ch === 0x3B) {
            return scanPunctuator();
        }

        // String literal starts with single quote (U+0027) or double quote (U+0022).
        if (ch === 0x27 || ch === 0x22) {
            return scanStringLiteral();
        }


        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 0x2E) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        // Slash (/) U+002F can also start a regex.
        if (extra.tokenize && ch === 0x2F) {
            return advanceSlash();
        }

        return scanPunctuator();
    }

    function collectToken() {
        var loc, token, range, value;

        skipComment();
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            value = source.slice(token.start, token.end);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: [token.start, token.end],
                loc: loc
            });
        }

        return token;
    }

    function lex() {
        var token;

        token = lookahead;
        index = token.end;
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();

        index = token.end;
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        return token;
    }

    function peek() {
        var pos, line, start;

        pos = index;
        line = lineNumber;
        start = lineStart;
        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        index = pos;
        lineNumber = line;
        lineStart = start;
    }

    function Position(line, column) {
        this.line = line;
        this.column = column;
    }

    function SourceLocation(startLine, startColumn, line, column) {
        this.start = new Position(startLine, startColumn);
        this.end = new Position(line, column);
    }

    SyntaxTreeDelegate = {

        name: 'SyntaxTree',

        processComment: function (node) {
            var lastChild, trailingComments;

            if (node.type === Syntax.Program) {
                if (node.body.length > 0) {
                    return;
                }
            }

            if (extra.trailingComments.length > 0) {
                if (extra.trailingComments[0].range[0] >= node.range[1]) {
                    trailingComments = extra.trailingComments;
                    extra.trailingComments = [];
                } else {
                    extra.trailingComments.length = 0;
                }
            } else {
                if (extra.bottomRightStack.length > 0 &&
                        extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments &&
                        extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments[0].range[0] >= node.range[1]) {
                    trailingComments = extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
                    delete extra.bottomRightStack[extra.bottomRightStack.length - 1].trailingComments;
                }
            }

            // Eating the stack.
            while (extra.bottomRightStack.length > 0 && extra.bottomRightStack[extra.bottomRightStack.length - 1].range[0] >= node.range[0]) {
                lastChild = extra.bottomRightStack.pop();
            }

            if (lastChild) {
                if (lastChild.leadingComments && lastChild.leadingComments[lastChild.leadingComments.length - 1].range[1] <= node.range[0]) {
                    node.leadingComments = lastChild.leadingComments;
                    delete lastChild.leadingComments;
                }
            } else if (extra.leadingComments.length > 0 && extra.leadingComments[extra.leadingComments.length - 1].range[1] <= node.range[0]) {
                node.leadingComments = extra.leadingComments;
                extra.leadingComments = [];
            }


            if (trailingComments) {
                node.trailingComments = trailingComments;
            }

            extra.bottomRightStack.push(node);
        },

        markEnd: function (node, startToken) {
            if (extra.range) {
                node.range = [startToken.start, index];
            }
            if (extra.loc) {
                node.loc = new SourceLocation(
                    startToken.startLineNumber === undefined ?  startToken.lineNumber : startToken.startLineNumber,
                    startToken.start - (startToken.startLineStart === undefined ?  startToken.lineStart : startToken.startLineStart),
                    lineNumber,
                    index - lineStart
                );
                this.postProcess(node);
            }

            if (extra.attachComment) {
                this.processComment(node);
            }
            return node;
        },

        postProcess: function (node) {
            if (extra.source) {
                node.loc.source = extra.source;
            }
            return node;
        },

        createArrayExpression: function (elements) {
            return {
                type: Syntax.ArrayExpression,
                elements: elements
            };
        },

        createAssignmentExpression: function (operator, left, right) {
            return {
                type: Syntax.AssignmentExpression,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBinaryExpression: function (operator, left, right) {
            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
                        Syntax.BinaryExpression;
            return {
                type: type,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBlockStatement: function (body) {
            return {
                type: Syntax.BlockStatement,
                body: body
            };
        },

        createBreakStatement: function (label) {
            return {
                type: Syntax.BreakStatement,
                label: label
            };
        },

        createCallExpression: function (callee, args) {
            return {
                type: Syntax.CallExpression,
                callee: callee,
                'arguments': args
            };
        },

        createCatchClause: function (param, body) {
            return {
                type: Syntax.CatchClause,
                param: param,
                body: body
            };
        },

        createConditionalExpression: function (test, consequent, alternate) {
            return {
                type: Syntax.ConditionalExpression,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createContinueStatement: function (label) {
            return {
                type: Syntax.ContinueStatement,
                label: label
            };
        },

        createDebuggerStatement: function () {
            return {
                type: Syntax.DebuggerStatement
            };
        },

        createDoWhileStatement: function (body, test) {
            return {
                type: Syntax.DoWhileStatement,
                body: body,
                test: test
            };
        },

        createEmptyStatement: function () {
            return {
                type: Syntax.EmptyStatement
            };
        },

        createExpressionStatement: function (expression) {
            return {
                type: Syntax.ExpressionStatement,
                expression: expression
            };
        },

        createForStatement: function (init, test, update, body) {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        },

        createForInStatement: function (left, right, body) {
            return {
                type: Syntax.ForInStatement,
                left: left,
                right: right,
                body: body,
                each: false
            };
        },

        createFunctionDeclaration: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionDeclaration,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createFunctionExpression: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionExpression,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createIdentifier: function (name) {
            return {
                type: Syntax.Identifier,
                name: name
            };
        },

        createIfStatement: function (test, consequent, alternate) {
            return {
                type: Syntax.IfStatement,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createLabeledStatement: function (label, body) {
            return {
                type: Syntax.LabeledStatement,
                label: label,
                body: body
            };
        },

        createLiteral: function (token) {
            return {
                type: Syntax.Literal,
                value: token.value,
                raw: source.slice(token.start, token.end)
            };
        },

        createMemberExpression: function (accessor, object, property) {
            return {
                type: Syntax.MemberExpression,
                computed: accessor === '[',
                object: object,
                property: property
            };
        },

        createNewExpression: function (callee, args) {
            return {
                type: Syntax.NewExpression,
                callee: callee,
                'arguments': args
            };
        },

        createObjectExpression: function (properties) {
            return {
                type: Syntax.ObjectExpression,
                properties: properties
            };
        },

        createPostfixExpression: function (operator, argument) {
            return {
                type: Syntax.UpdateExpression,
                operator: operator,
                argument: argument,
                prefix: false
            };
        },

        createProgram: function (body) {
            return {
                type: Syntax.Program,
                body: body
            };
        },

        createProperty: function (kind, key, value) {
            return {
                type: Syntax.Property,
                key: key,
                value: value,
                kind: kind
            };
        },

        createReturnStatement: function (argument) {
            return {
                type: Syntax.ReturnStatement,
                argument: argument
            };
        },

        createSequenceExpression: function (expressions) {
            return {
                type: Syntax.SequenceExpression,
                expressions: expressions
            };
        },

        createSwitchCase: function (test, consequent) {
            return {
                type: Syntax.SwitchCase,
                test: test,
                consequent: consequent
            };
        },

        createSwitchStatement: function (discriminant, cases) {
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases
            };
        },

        createThisExpression: function () {
            return {
                type: Syntax.ThisExpression
            };
        },

        createThrowStatement: function (argument) {
            return {
                type: Syntax.ThrowStatement,
                argument: argument
            };
        },

        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
            return {
                type: Syntax.TryStatement,
                block: block,
                guardedHandlers: guardedHandlers,
                handlers: handlers,
                finalizer: finalizer
            };
        },

        createUnaryExpression: function (operator, argument) {
            if (operator === '++' || operator === '--') {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: true
                };
            }
            return {
                type: Syntax.UnaryExpression,
                operator: operator,
                argument: argument,
                prefix: true
            };
        },

        createVariableDeclaration: function (declarations, kind) {
            return {
                type: Syntax.VariableDeclaration,
                declarations: declarations,
                kind: kind
            };
        },

        createVariableDeclarator: function (id, init) {
            return {
                type: Syntax.VariableDeclarator,
                id: id,
                init: init
            };
        },

        createWhileStatement: function (test, body) {
            return {
                type: Syntax.WhileStatement,
                test: test,
                body: body
            };
        },

        createWithStatement: function (object, body) {
            return {
                type: Syntax.WithStatement,
                object: object,
                body: body
            };
        }
    };

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
                    assert(index < args.length, 'Message reference must be in range');
                    return args[index];
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.start;
            error.lineNumber = token.lineNumber;
            error.column = token.start - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        error.description = msg;
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
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
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
        var line;

        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(index) === 0x3B || match(';')) {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpected(lookahead);
        }
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [], startToken;

        startToken = lookahead;
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

        lex();

        return delegate.markEnd(delegate.createArrayExpression(elements), startToken);
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(param, first) {
        var previousStrict, body, startToken;

        previousStrict = strict;
        startToken = lookahead;
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwErrorTolerant(first, Messages.StrictParamName);
        }
        strict = previousStrict;
        return delegate.markEnd(delegate.createFunctionExpression(null, param, [], body), startToken);
    }

    function parseObjectPropertyKey() {
        var token, startToken;

        startToken = lookahead;
        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return delegate.markEnd(delegate.createLiteral(token), startToken);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
    }

    function parseObjectProperty() {
        var token, key, id, value, param, startToken;

        token = lookahead;
        startToken = lookahead;

        if (token.type === Token.Identifier) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                value = parsePropertyFunction([]);
                return delegate.markEnd(delegate.createProperty('get', key, value), startToken);
            }
            if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead;
                if (token.type !== Token.Identifier) {
                    expect(')');
                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
                    value = parsePropertyFunction([]);
                } else {
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    value = parsePropertyFunction(param, token);
                }
                return delegate.markEnd(delegate.createProperty('set', key, value), startToken);
            }
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', id, value), startToken);
        }
        if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', key, value), startToken);
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, key, kind, map = {}, toString = String, startToken;

        startToken = lookahead;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

            key = '$' + name;
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (map[key] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[key] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[key] |= kind;
            } else {
                map[key] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return delegate.markEnd(delegate.createObjectExpression(properties), startToken);
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
        var type, token, expr, startToken;

        if (match('(')) {
            return parseGroupExpression();
        }

        if (match('[')) {
            return parseArrayInitialiser();
        }

        if (match('{')) {
            return parseObjectInitialiser();
        }

        type = lookahead.type;
        startToken = lookahead;

        if (type === Token.Identifier) {
            expr =  delegate.createIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && lookahead.octal) {
                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
            }
            expr = delegate.createLiteral(lex());
        } else if (type === Token.Keyword) {
            if (matchKeyword('function')) {
                return parseFunctionExpression();
            }
            if (matchKeyword('this')) {
                lex();
                expr = delegate.createThisExpression();
            } else {
                throwUnexpected(lex());
            }
        } else if (type === Token.BooleanLiteral) {
            token = lex();
            token.value = (token.value === 'true');
            expr = delegate.createLiteral(token);
        } else if (type === Token.NullLiteral) {
            token = lex();
            token.value = null;
            expr = delegate.createLiteral(token);
        } else if (match('/') || match('/=')) {
            if (typeof extra.tokens !== 'undefined') {
                expr = delegate.createLiteral(collectRegex());
            } else {
                expr = delegate.createLiteral(scanRegExp());
            }
            peek();
        } else {
            throwUnexpected(lex());
        }

        return delegate.markEnd(expr, startToken);
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
        var token, startToken;

        startToken = lookahead;
        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
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
        var callee, args, startToken;

        startToken = lookahead;
        expectKeyword('new');
        callee = parseLeftHandSideExpression();
        args = match('(') ? parseArguments() : [];

        return delegate.markEnd(delegate.createNewExpression(callee, args), startToken);
    }

    function parseLeftHandSideExpressionAllowCall() {
        var previousAllowIn, expr, args, property, startToken;

        startToken = lookahead;

        previousAllowIn = state.allowIn;
        state.allowIn = true;
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        state.allowIn = previousAllowIn;

        for (;;) {
            if (match('.')) {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            } else if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
            } else if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                break;
            }
            delegate.markEnd(expr, startToken);
        }

        return expr;
    }

    function parseLeftHandSideExpression() {
        var previousAllowIn, expr, property, startToken;

        startToken = lookahead;

        previousAllowIn = state.allowIn;
        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
        state.allowIn = previousAllowIn;

        while (match('.') || match('[')) {
            if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            }
            delegate.markEnd(expr, startToken);
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token, startToken = lookahead;

        expr = parseLeftHandSideExpressionAllowCall();

        if (lookahead.type === Token.Punctuator) {
            if ((match('++') || match('--')) && !peekLineTerminator()) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
                }

                if (!isLeftHandSide(expr)) {
                    throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
                }

                token = lex();
                expr = delegate.markEnd(delegate.createPostfixExpression(token.value, expr), startToken);
            }
        }

        return expr;
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr, startToken;

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            startToken = lookahead;
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            expr = delegate.createUnaryExpression(token.value, expr);
            expr = delegate.markEnd(expr, startToken);
        } else if (match('+') || match('-') || match('~') || match('!')) {
            startToken = lookahead;
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
            expr = delegate.markEnd(expr, startToken);
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            startToken = lookahead;
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
            expr = delegate.markEnd(expr, startToken);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
        } else {
            expr = parsePostfixExpression();
        }

        return expr;
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, stack, right, operator, left, i;

        marker = lookahead;
        left = parseUnaryExpression();

        token = lookahead;
        prec = binaryPrecedence(token, state.allowIn);
        if (prec === 0) {
            return left;
        }
        token.prec = prec;
        lex();

        markers = [marker, lookahead];
        right = parseUnaryExpression();

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                expr = delegate.createBinaryExpression(operator, left, right);
                markers.pop();
                marker = markers[markers.length - 1];
                delegate.markEnd(expr, marker);
                stack.push(expr);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(lookahead);
            expr = parseUnaryExpression();
            stack.push(expr);
        }

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
            marker = markers.pop();
            delegate.markEnd(expr, marker);
        }

        return expr;
    }


    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate, startToken;

        startToken = lookahead;

        expr = parseBinaryExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = parseAssignmentExpression();

            expr = delegate.createConditionalExpression(expr, consequent, alternate);
            delegate.markEnd(expr, startToken);
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, left, right, node, startToken;

        token = lookahead;
        startToken = lookahead;

        node = left = parseConditionalExpression();

        if (matchAssign()) {
            // LeftHandSideExpression
            if (!isLeftHandSide(left)) {
                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            token = lex();
            right = parseAssignmentExpression();
            node = delegate.markEnd(delegate.createAssignmentExpression(token.value, left, right), startToken);
        }

        return node;
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr, startToken = lookahead;

        expr = parseAssignmentExpression();

        if (match(',')) {
            expr = delegate.createSequenceExpression([ expr ]);

            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }

            delegate.markEnd(expr, startToken);
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
        var block, startToken;

        startToken = lookahead;
        expect('{');

        block = parseStatementList();

        expect('}');

        return delegate.markEnd(delegate.createBlockStatement(block), startToken);
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token, startToken;

        startToken = lookahead;
        token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value), startToken);
    }

    function parseVariableDeclaration(kind) {
        var init = null, id, startToken;

        startToken = lookahead;
        id = parseVariableIdentifier();

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

        return delegate.markEnd(delegate.createVariableDeclarator(id, init), startToken);
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

        return delegate.createVariableDeclaration(declarations, 'var');
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations, startToken;

        startToken = lookahead;

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, kind), startToken);
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');
        return delegate.createEmptyStatement();
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();
        consumeSemicolon();
        return delegate.createExpressionStatement(expr);
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

        return delegate.createIfStatement(test, consequent, alternate);
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

        return delegate.createDoWhileStatement(body, test);
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

        return delegate.createWhileStatement(test, body);
    }

    function parseForVariableDeclaration() {
        var token, declarations, startToken;

        startToken = lookahead;
        token = lex();
        declarations = parseVariableDeclarationList();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, token.value), startToken);
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
                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
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

        return (typeof left === 'undefined') ?
                delegate.createForStatement(init, test, update, body) :
                delegate.createForInStatement(left, right, body);
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(index) === 0x3B) {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return delegate.createContinueStatement(label);
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (U+003B).
        if (source.charCodeAt(index) === 0x3B) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return delegate.createBreakStatement(label);
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(index) === 0x20) {
            if (isIdentifierStart(source.charCodeAt(index + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return delegate.createReturnStatement(argument);
            }
        }

        if (peekLineTerminator()) {
            return delegate.createReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return delegate.createReturnStatement(argument);
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            // TODO(ikarienator): Should we update the test cases instead?
            skipComment();
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return delegate.createWithStatement(object, body);
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test, consequent = [], statement, startToken;

        startToken = lookahead;
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
            consequent.push(statement);
        }

        return delegate.markEnd(delegate.createSwitchCase(test, consequent), startToken);
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        cases = [];

        if (match('}')) {
            lex();
            return delegate.createSwitchStatement(discriminant, cases);
        }

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

        return delegate.createSwitchStatement(discriminant, cases);
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

        return delegate.createThrowStatement(argument);
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param, body, startToken;

        startToken = lookahead;
        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead);
        }

        param = parseVariableIdentifier();
        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return delegate.markEnd(delegate.createCatchClause(param, body), startToken);
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

        return delegate.createTryStatement(block, [], handlers, finalizer);
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return delegate.createDebuggerStatement();
    }

    // 12 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key,
            startToken;

        if (type === Token.EOF) {
            throwUnexpected(lookahead);
        }

        if (type === Token.Punctuator && lookahead.value === '{') {
            return parseBlock();
        }

        startToken = lookahead;

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return delegate.markEnd(parseEmptyStatement(), startToken);
            case '(':
                return delegate.markEnd(parseExpressionStatement(), startToken);
            default:
                break;
            }
        }

        if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return delegate.markEnd(parseBreakStatement(), startToken);
            case 'continue':
                return delegate.markEnd(parseContinueStatement(), startToken);
            case 'debugger':
                return delegate.markEnd(parseDebuggerStatement(), startToken);
            case 'do':
                return delegate.markEnd(parseDoWhileStatement(), startToken);
            case 'for':
                return delegate.markEnd(parseForStatement(), startToken);
            case 'function':
                return delegate.markEnd(parseFunctionDeclaration(), startToken);
            case 'if':
                return delegate.markEnd(parseIfStatement(), startToken);
            case 'return':
                return delegate.markEnd(parseReturnStatement(), startToken);
            case 'switch':
                return delegate.markEnd(parseSwitchStatement(), startToken);
            case 'throw':
                return delegate.markEnd(parseThrowStatement(), startToken);
            case 'try':
                return delegate.markEnd(parseTryStatement(), startToken);
            case 'var':
                return delegate.markEnd(parseVariableStatement(), startToken);
            case 'while':
                return delegate.markEnd(parseWhileStatement(), startToken);
            case 'with':
                return delegate.markEnd(parseWithStatement(), startToken);
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return delegate.markEnd(delegate.createLabeledStatement(expr, labeledBody), startToken);
        }

        consumeSemicolon();

        return delegate.markEnd(delegate.createExpressionStatement(expr), startToken);
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody, startToken;

        startToken = lookahead;
        expect('{');

        while (index < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
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

        return delegate.markEnd(delegate.createBlockStatement(sourceElements), startToken);
    }

    function parseParams(firstRestricted) {
        var param, params = [], token, stricted, paramSet, key, message;
        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead;
                param = parseVariableIdentifier();
                key = '$' + token.value;
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
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
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[key] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return {
            params: params,
            stricted: stricted,
            firstRestricted: firstRestricted,
            message: message
        };
    }

    function parseFunctionDeclaration() {
        var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict, startToken;

        startToken = lookahead;

        expectKeyword('function');
        token = lookahead;
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

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionDeclaration(id, params, [], body), startToken);
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict, startToken;

        startToken = lookahead;
        expectKeyword('function');

        if (!match('(')) {
            token = lookahead;
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

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionExpression(id, params, [], body), startToken);
    }

    // 14 Program

    function parseSourceElement() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(lookahead.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (lookahead.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.start + 1, token.end - 1);
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
            /* istanbul ignore if */
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseProgram() {
        var body, startToken;

        skipComment();
        peek();
        startToken = lookahead;
        strict = false;

        body = parseSourceElements();
        return delegate.markEnd(delegate.createProgram(body), startToken);
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

    function tokenize(code, options) {
        var toString,
            token,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            token = lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    token = lex();
                } catch (lexError) {
                    token = lookahead;
                    if (extra.errors) {
                        extra.errors.push(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            filterTokenLocation();
            tokens = extra.tokens;
            if (typeof extra.comments !== 'undefined') {
                tokens.comments = extra.comments;
            }
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;
            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
            if (extra.attachComment) {
                extra.range = true;
                extra.comments = [];
                extra.bottomRightStack = [];
                extra.trailingComments = [];
                extra.leadingComments = [];
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with *.json manifests.
    exports.version = '1.2.2';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
   /* istanbul ignore next */
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

},{}],90:[function(_dereq_,module,exports){
module.exports={
    "requireCurlyBraces": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "try",
        "catch"
    ],
    "requireOperatorBeforeLineBreak": true,
    "requireCamelCaseOrUpperCaseIdentifiers": true,
    "maximumLineLength": {
      "value": 80,
      "allowComments": true,
      "allowRegex": true
    },
    "validateIndentation": 2,
    "validateQuoteMarks": "'",

    "disallowMultipleLineStrings": true,
    "disallowMixedSpacesAndTabs": true,
    "disallowTrailingWhitespace": true,


    "requireSpaceAfterKeywords": [
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "return",
      "try",
      "catch"
    ],
    "requireSpaceBeforeBinaryOperators": [
        "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
        "&=", "|=", "^=", "+=",

        "+", "-", "*", "/", "%", "<<", ">>", ">>>", "&",
        "|", "^", "&&", "||", "===", "==", ">=",
        "<=", "<", ">", "!=", "!=="
    ],
    "requireSpaceAfterBinaryOperators": true,
    "requireSpacesInConditionalExpression": true,
    "requireSpaceBeforeBlockStatements": true,
    "requireLineFeedAtFileEnd": true,
    "requireSpacesInFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },
    "validateJSDoc": {
        "checkParamNames": true,
        "requireParamTypes": true
    },

    "disallowMultipleLineBreaks": true
}

},{}],91:[function(_dereq_,module,exports){
module.exports={
    "requireCurlyBraces": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "try",
        "catch"
    ],
    "requireOperatorBeforeLineBreak": true,
    "requireParenthesesAroundIIFE": true,
    "requireMultipleVarDecl": "onevar",
    "requireCommaBeforeLineBreak": true,
    "requireCamelCaseOrUpperCaseIdentifiers": true,
    "requireDotNotation": true,
    "maximumLineLength": {
        "value": 100,
        "tabSize": 4,
        "allowUrlComments": true,
        "allowRegex": true
    },
    "validateQuoteMarks": { "mark": "\"", "escape": true },

    "disallowMixedSpacesAndTabs": "smart",
    "disallowTrailingWhitespace": true,
    "disallowMultipleLineStrings": true,
    "disallowTrailingComma": true,


    "requireSpacesInFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },
    "requireSpaceAfterKeywords": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "return",
        "try",
        "catch"
    ],
    "requireSpacesInsideObjectBrackets": "all",
    "requireSpacesInsideArrayBrackets": "all",
    "requireSpacesInConditionalExpression": true,
    "requireSpaceAfterBinaryOperators": true,
    "requireLineFeedAtFileEnd": true,
    "requireSpaceBeforeBinaryOperators": [
        "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
        "&=", "|=", "^=", "+=",

        "+", "-", "*", "/", "%", "<<", ">>", ">>>", "&",
        "|", "^", "&&", "||", "===", "==", ">=",
        "<=", "<", ">", "!=", "!=="
    ],
    "requireSpacesInAnonymousFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },
    "requireSpacesInNamedFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },
    "validateLineBreaks": "LF",

    "disallowKeywords": [ "with" ],
    "disallowKeywordsOnNewLine": [ "else" ],
    "disallowSpacesInFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "disallowSpacesInNamedFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "disallowSpacesInAnonymousFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "disallowSpaceAfterObjectKeys": true,
    "disallowSpaceAfterPrefixUnaryOperators": true,
    "disallowSpaceBeforePostfixUnaryOperators": true,
    "disallowSpaceBeforeBinaryOperators": [ ",", ":" ],
    "disallowMultipleLineBreaks": true
}

},{}],92:[function(_dereq_,module,exports){
module.exports={
    "requireCurlyBraces": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "try",
        "catch"
    ],
    "requireSpaceAfterKeywords": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "return",
        "try",
        "catch",
        "function",
        "typeof"
    ],
    "requireSpaceBeforeBlockStatements": true,
    "requireParenthesesAroundIIFE": true,
    "requireSpacesInConditionalExpression": true,
    "disallowSpacesInNamedFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "disallowSpacesInFunctionDeclaration": {
        "beforeOpeningRoundBrace": true
    },
    "requireMultipleVarDecl": "onevar",
    "requireBlocksOnNewline": 1,
    "disallowEmptyBlocks": true,
    "requireSpacesInsideObjectBrackets": "all",
    "requireSpacesInsideArrayBrackets": "all",
    "disallowQuotedKeysInObjects": true,
    "disallowDanglingUnderscores": true,
    "disallowSpaceAfterObjectKeys": true,
    "requireCommaBeforeLineBreak": true,
    "disallowSpaceAfterPrefixUnaryOperators": true,
    "disallowSpaceBeforePostfixUnaryOperators": true,
    "disallowSpaceBeforeBinaryOperators": [
        ","
    ],
    "requireSpaceBeforeBinaryOperators": [
        "=",
        "+=",
        "-=",
        "+",
        "-",
        "*",
        "/",
        "&&",
        "||",
        "===",
        "==",
        ">=",
        "<=",
        ">",
        "<",
        "!=",
        "!=="
    ],
    "requireSpaceAfterBinaryOperators": true,
    "requireCamelCaseOrUpperCaseIdentifiers": true,
    "disallowKeywords": [ "with" ],
    "disallowMultipleLineBreaks": true,
    "validateLineBreaks": "LF",
    "validateQuoteMarks": "'",
    "validateIndentation": "\t",
    "disallowMixedSpacesAndTabs": true,
    "disallowTrailingWhitespace": true,
    "disallowTrailingComma": true,
    "disallowKeywordsOnNewLine": [ "else" ],
    "requireLineFeedAtFileEnd": true,
    "requireCapitalizedConstructors": true,
    "requireDotNotation": true,
    "disallowYodaConditions": true
}

},{}],93:[function(_dereq_,module,exports){
module.exports={
    "requireCurlyBraces": [
        "if",
        "else",
        "for",
        "while",
        "do"
    ],
    "requireSpaceAfterKeywords": [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "return",
        "function",
        "catch"
    ],
    "disallowKeywords": [
        "with"
    ],
    "disallowKeywordsOnNewLine": [
        "else",
        "catch"
    ],

    "disallowSpaceAfterPrefixUnaryOperators": true,
    "disallowSpaceBeforePostfixUnaryOperators": [
        "++",
        "--"
    ],
    "requireSpaceBeforeBinaryOperators": [
        "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
        "&=", "|=", "^=",

        "+", "-", "*", "/", "%", "<<", ">>", ">>>", "&",
        "|", "^", "&&", "||", "===", "==", ">=",
        "<=", "<", ">", "!=", "!=="
    ],
    "requireSpaceAfterBinaryOperators": true,

    "disallowMultipleVarDecl": true,

    "disallowSpacesInsideParentheses": true,
    "disallowEmptyBlocks": true,

    "requireParenthesesAroundIIFE": true,
    "requireSpacesInFunctionDeclaration": {
        "beforeOpeningCurlyBrace": true
    },
    "disallowSpacesInFunctionDeclaration": {
        "beforeOpeningRoundBrace": true
    },
    "requireSpacesInAnonymousFunctionExpression": {
        "beforeOpeningRoundBrace": true,
        "beforeOpeningCurlyBrace": true
    },
    "disallowSpacesInNamedFunctionExpression": {
        "beforeOpeningRoundBrace": true
    },
    "requireSpacesInNamedFunctionExpression": {
        "beforeOpeningCurlyBrace": true
    },

    "requireSpacesInConditionalExpression": {
        "afterTest": true,
        "beforeConsequent": true,
        "afterConsequent": true,
        "beforeAlternate": true
    },

    "disallowSpaceBeforeBinaryOperators": [
        ","
    ],
    "requireCommaBeforeLineBreak": true,

    "validateQuoteMarks": "'",
    "disallowMultipleLineStrings": true,

    "disallowImplicitTypeConversion": [
        "numeric",
        "boolean",
        "binary",
        "string"
    ],
    "disallowYodaConditions": true,

    "disallowSpacesInsideArrayBrackets": true,

    "requireDotNotation": true,
    "disallowSpaceAfterObjectKeys": true,
    "disallowSpacesInsideObjectBrackets": true,
    "disallowQuotedKeysInObjects": true,

    "validateJSDoc": {
        "checkParamNames": true,
        "requireParamTypes": true
    },

    "maximumLineLength": {
        "value": 120,
        "allowUrlComments": true
    },
    "requireLineFeedAtFileEnd": true,
    "disallowMultipleLineBreaks": true,
    "disallowMixedSpacesAndTabs": true,
    "disallowTrailingWhitespace": true,
    "validateLineBreaks": "LF"
}

},{}]},{},[77])
(77)
});