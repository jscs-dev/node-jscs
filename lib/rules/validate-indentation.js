/**
 * Validates indentation for switch statements and block statements
 *
 * Types: `Integer`, `String` or `Object`
 *
 * Values:
 *  - `Integer`: A positive number of spaces
 *  - `String`: `"\t"` for tab indentation
 *  - `Object`:
 *     - `value`: (required) the same effect as the non-object values
 *     - `includeEmptyLines` (*deprecated*): (default: `false`) require empty lines to be indented
 *     - `'allExcept'` array of exceptions:
 *       - `'comments'` ignores comments
 *       - `'emptyLines'` ignore empty lines, included by default
 *
 * JSHint: [`indent`](http://jshint.com/docs/options/#indent)
 *
 * #### Example
 *
 * ```js
 * "validateIndentation": "\t"
 * ```
 *
 * ##### Valid example for mode `2`
 *
 * ```js
 * if (a) {
 *   b=c;
 *   function(d) {
 *     e=f;
 *   }
 * }
 * ```
 *
 * ##### Invalid example for mode `2`
 *
 * ```js
 * if (a) {
 *    b=c;
 * function(d) {
 *        e=f;
 * }
 * }
 * ```
 *
 * ##### Valid example for mode `"\t"`
 *
 * ```js
 * if (a) {
 *     b=c;
 *     function(d) {
 *         e=f;
 *     }
 * }
 * ```
 *
 * ##### Invalid example for mode `"\t"`
 *
 * ```js
 * if (a) {
 *      b=c;
 * function(d) {
 *            e=f;
 *  }
 * }
 * ```
 *
 * ##### Valid example for mode `{ "value": "\t", "allExcept": ["emptyLines"] }`
 * ```js
 * if (a) {
 *     b=c;
 *     function(d) {
 *         e=f;
 *     }
 *
 * } // single tab character on previous line
 * ```
 *
 * ##### Invalid example for mode `{ "value": "\t", "allExcept": ["emptyLines"] } }`
 * ```js
 * if (a) {
 *     b=c;
 *     function(d) {
 *         e=f;
 *     }
 *
 * } // no tab character on previous line
 * ```
 *
 * ##### Valid example for mode `{ "value": "\t", "allExcept": ["comments"] }`
 * ```js
 * if (a) {
 *     b=c;
 * //    e=f
 * }
 * ```
 */

var assert = require('assert');
var cst = require('cst');

var nonBlockIndentChecks = {
    'IfStatement': ['consequent', 'alternate'],
    'DoWhileStatement': ['body'],
    'WhileStatement': ['body'],
    'ForStatement': ['body'],
    'ForInStatement': ['body'],
    'ForOfStatement': ['body']
};

var keywordsToCheck = {
    'else': true,
    'finally': true,
    'catch': true,
    'while': true
};

var LINE_SEPARATOR = /\r\n|\r|\n/g;
var NON_WHITESPACE = /[^\s]/;

/**
 * Returns lines and line offsets for specified string.
 *
 * @param {String} code
 * @returns {({line: String, offset: Number})[]}
 */
function getLineData(code) {
    var lines = [];
    var lastPos = 0;
    LINE_SEPARATOR.lastIndex = 0;
    var match;
    while ((match = LINE_SEPARATOR.exec(code)) !== null) {
        var separatorLength = match[0].length;
        lines.push({
            line: code.slice(lastPos, match.index),
            separator: code.substr(match.index, separatorLength),
            offset: lastPos
        });
        lastPos = match.index + separatorLength;
    }
    lines.push({line: code.slice(lastPos), offset: lastPos, separator: ''});
    return lines;
}

/**
 * @param {Object[]} lines
 * @returns {String}
 */
function convertLinesToString(lines) {
    return lines
        .map(function(lineItem) {
            return lineItem.line + lineItem.separator;
        })
        .join('');
}

/**
 * Applies indentation diff.
 *
 * @param {String} code
 * @param {Number} diff
 * @param {String} indentChar
 * @param {Boolean} includeEmptyLines
 */
function applyIndentationDiff(code, diff, indentChar, includeEmptyLines) {
    var lines = getLineData(code);
    for (var i = 1; i < lines.length; i++) {
        var lineData = lines[i];
        var currentIndent;
        if (lineData.line.length === 0 && i !== lines.length - 1 && !includeEmptyLines) {
            continue;
        }
        var match = NON_WHITESPACE.exec(lineData.line);
        if (match) {
            currentIndent = match.index;
        } else {
            currentIndent = lineData.line.length;
        }
        lineData.line = new Array(Math.max(currentIndent + diff, 0) + 1).join(indentChar) +
            lineData.line.slice(currentIndent);
    }
    return convertLinesToString(lines);
}

/**
 * Returns true if function expression is passed.
 *
 * @param {Node} node
 * @returns {Boolean}
 */
function isFunctionExpression(node) {
    return node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
}

/**
 * Returns module block statement. Works with IIFE, require, define.
 *
 * @param {Program} program
 * @returns {BlockStatement|null}
 */
function getModuleBody(program) {
    if (program.body.length !== 1) {
        return null;
    }
    if (program.body[0].type !== 'ExpressionStatement') {
        return null;
    }
    var expression = program.body[0].expression;
    if (expression.type === 'CallExpression') {
        var callee = expression.callee;
        var args = expression.arguments;

        // full file IIFE
        if (isFunctionExpression(callee)) {

            // detect UMD Shim, where the file body is the body of the factory,
            // which is the sole argument to the IIFE
            if (args.length === 1 && isFunctionExpression(args[0])) {
                return args[0].body;
            } else {
                return callee.body;
            }
        }

        // full file IIFE with call/apply
        if (
            callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            (callee.property.name === 'apply' || callee.property.name === 'call')
        ) {
            if (isFunctionExpression(callee.object)) {
                return callee.object.body;
            }
        }

        // require / define
        if (callee.type === 'Identifier' && (callee.name === 'define' || callee.name === 'require')) {
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (isFunctionExpression(arg)) {
                    return arg.body;
                }
            }
        }
    }

    return null;
}

/**
 * Checks for: `case 'xxx': {`
 *
 * @param {Element} element
 * @returns {Boolean}
 */
function isBlockOnTheSameLineWithCase(element) {
    var currentSwitchElement = element.parentElement
        .consequent[0]
        .getPreviousCodeToken()
        .nextSibling;
    while (currentSwitchElement) {
        if (currentSwitchElement === element) {
            return true;
        }
        if (currentSwitchElement.getNewlineCount() > 0) {
            break;
        }
        currentSwitchElement = currentSwitchElement.nextSibling;
    }
    return false;
}

/**
 * Returns true for situations like `if ... else`, `try ... catch`.
 * I.e. two blocks within one statement.
 *
 * @param {Element} blockStatement
 * @returns {*}
 */
function hasFollowingClause(blockStatement) {
    var parent = blockStatement.parentElement;
    if (parent.type === 'IfStatement') {
        return parent.consequent === blockStatement && parent.alternate;
    }
    if (parent.type === 'TryStatement') {
        return true;
    }
    if (parent.type === 'DoWhileStatement') {
        return true;
    }
    if (parent.type === 'CatchClause') {
        return parent.parentElement.finalizer;
    }
}

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        this._includeEmptyLines = false;
        this._exceptComments = false;

        if (typeof options === 'object') {
            this._includeEmptyLines = (options.includeEmptyLines === true);
            if (Array.isArray(options.allExcept)) {
                this._exceptComments = options.allExcept.indexOf('comments') > -1;
                this._includeEmptyLines = options.allExcept.indexOf('emptyLines') === -1;
            }

            options = options.value;
        }

        assert(
            options === '\t' ||
                (typeof options === 'number' && options > 0),
            this.getOptionName() + ' option requires a positive number of spaces or "\\t"' +
            ' or options object with "value" property'
        );

        if (typeof options === 'number') {
            this._indentChar = ' ';
            this._nonIndentChar = '\t';
            this._indentSize = options;
        } else {
            this._nonIndentChar = ' ';
            this._indentChar = '\t';
            this._indentSize = 1;
        }

        this._indentBreaks = null;
        this._indentModuleBodies = null;
    },

    getOptionName: function() {
        return 'validateIndentation';
    },

    /**
     * Calculates user-implied indent for function expression.
     *
     * @param {FunctionExpression|ArrowFunctionExpression} functionExpression
     * @param {Number} indent
     * @returns {Number}
     * @private
     */
    _getFunctionIndent: function(functionExpression, indent) {
        var functionIndent = 0;
        var indentBeforeClosingBrace = this._getElementDirectIndent(functionExpression.body.lastChild);
        if (indentBeforeClosingBrace !== null) {
            functionIndent = indentBeforeClosingBrace + 1;
        }
        var indentBeforeFunction = this._getElementDirectIndent(functionExpression);
        if (indentBeforeFunction !== null) {
            functionIndent = Math.min(functionIndent, indentBeforeFunction  + 1);
        }
        return Math.max(indent, functionIndent);
    },

    /**
     * Calculates user-implied indent for object expression.
     *
     * @param {ObjectExpression} objectExpression
     * @param {Number} indent
     * @returns {Number}
     * @private
     */
    _getObjectExpressionIndent: function(objectExpression, indent) {
        var objectIndent = 0;
        var properties = objectExpression.properties;

        // Handling nested one-line objects, i.e. `{prop: {\n`
        if (objectExpression.parentElement.type === 'ObjectProperty') {
            var parentObjectExpressionBrace = objectExpression.parentElement.parentElement.firstChild;
            var currentToken = objectExpression.getPreviousToken();
            while (currentToken) {
                if (currentToken === parentObjectExpressionBrace) {
                    indent--;
                    break;
                }
                if (currentToken.getNewlineCount() > 0) {
                    break;
                }
                currentToken = currentToken.getPreviousToken();
            }
        }
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            objectIndent = this._getElementDirectIndent(property);
            if (objectIndent !== null) {
                break;
            }

        }
        return Math.max(indent, objectIndent);
    },

    /**
     * Returns indentation for specified element if element is indented.
     *
     * @param {Node} node
     * @returns {Number|null}
     * @private
     */
    _getElementDirectIndent: function(node) {
        var whitespaceToken = node.getPreviousToken();
        if (whitespaceToken.isWhitespace && whitespaceToken.getNewlineCount() > 0) {
            var endTokenLines = whitespaceToken.getSourceCodeLines();
            return Math.floor(endTokenLines[endTokenLines.length - 1].length / this._indentSize);
        }
        return null;
    },

    /**
     * Checks indentation for an AST Node.
     *
     * @param {Node} parentElement
     * @param {Errors} errors
     * @param {Number} initialIndent
     * @param {Object} options
     * @param {BlockStatement|null} options.moduleBody
     * @param {BlockStatement|null} options.firstWhitespace
     * @private
     */
    _checkNode: function(parentElement, errors, initialIndent, options) {
        var moduleBody = options.moduleBody;
        var firstWhitespace = options.firstWhitespace;
        var isBlock = false;
        var isModuleBody = false;
        var checkBlockIndentation = false;
        var indent = initialIndent;
        var isSwitchStatement = parentElement.type === 'SwitchStatement';
        var calculateFunctionExpressionIndent = null;
        var indentCases = null;

        if (isSwitchStatement) {
            indent++;
            isBlock = true;
            checkBlockIndentation = true;
        }
        if (parentElement.type === 'Program') {
            checkBlockIndentation = true;
        }
        if (parentElement.type === 'BlockStatement') {
            indent++;
            isBlock = true;
            checkBlockIndentation = true;
            isModuleBody = parentElement === moduleBody;
            if (isModuleBody && this._indentModuleBodies === false) {
                indent--;
            } else if (parentElement.parentElement.type === 'SwitchCase') {
                // Avoiding additional indentation if `{` is on the same line with case block start
                if (isBlockOnTheSameLineWithCase(parentElement)) {
                    indent--;
                }
            } else {
                // Calculating indentation for function expressions.
                calculateFunctionExpressionIndent = isFunctionExpression(parentElement.parentElement);
                if (calculateFunctionExpressionIndent) {
                    indent = this._getFunctionIndent(parentElement.parentElement, indent);
                }
            }
        }
        if (parentElement.type === 'ClassBody') {
            indent++;
            isBlock = true;
            checkBlockIndentation = true;
        }
        if (parentElement.type === 'SwitchCase') {
            indent++;
            checkBlockIndentation = true;
        }
        if (parentElement.type === 'ObjectExpression') {
            indent++;
            indent = this._getObjectExpressionIndent(parentElement, indent);
            isBlock = true;
            checkBlockIndentation = true;
        }
        var nonBlockChecks = nonBlockIndentChecks[parentElement.type];
        var statementsToCheck;
        if (nonBlockChecks) {
            statementsToCheck = nonBlockChecks.filter(function(propName) {
                return parentElement[propName] && parentElement[propName].type !== 'BlockStatement';
            });
        }

        var element = parentElement.firstChild;
        while (element) {
            if (element.isToken) {
                var isFirstWhitespace = element === firstWhitespace;
                if (element.isWhitespace && (element.getNewlineCount() > 0 || isFirstWhitespace)) {
                    var lines = getLineData(element.getSourceCode());
                    var lineOffset = this._includeEmptyLines ?
                        (isFirstWhitespace ? 0 : 1) :
                        lines.length - 1;
                    lines = lines.slice(lineOffset);

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].line;
                        if (line.indexOf(this._nonIndentChar) !== -1) {
                            errors.add(
                                'Invalid indentation character: ' + this._nonIndentChar,
                                element,
                                lines[i].offset
                            );
                        }
                        var nextSibling = element.nextSibling;
                        var checkForStatement = false;
                        var checkForKeyword = false;
                        if (!checkBlockIndentation) {
                            if (statementsToCheck && statementsToCheck.length > 0) {
                                if (statementsToCheck.indexOf(nextSibling) !== -1) {
                                    checkForStatement = true;
                                }
                            }
                            var nextToken = element.getNextToken();
                            if (nextToken &&
                                nextToken.isToken &&
                                nextToken.type === 'Keyword' &&
                                keywordsToCheck[nextToken.value]
                            ) {
                                checkForKeyword = true;
                            }
                        }
                        if (checkBlockIndentation || checkForStatement || checkForKeyword) {
                            var isLastLine = i === lines.length - 1;
                            var expectedIndent = indent;

                            if (checkForStatement) {
                                expectedIndent++;
                            }

                            // If it is the last line in the multiline indent
                            if (isLastLine && nextSibling) {

                                var hasExpectedIndent = expectedIndent * this._indentSize === line.length;

                                if (isBlock) {

                                    // Handling "{" and "}" in block statements.
                                    if (
                                        nextSibling === parentElement.lastChild ||
                                        nextSibling === parentElement.firstChild
                                    ) {
                                        expectedIndent = Math.max(0, expectedIndent - 1);

                                    // Handling module bodies (i.e. require, define)
                                    } else if (isModuleBody) {
                                        if (this._indentModuleBodies === null) {
                                            this._indentModuleBodies = hasExpectedIndent;
                                            if (!this._indentModuleBodies) {
                                                indent--;
                                                expectedIndent--;
                                            }
                                        }

                                    // Handling switch statement cases
                                    } else if (isSwitchStatement) {
                                        if (indentCases === null) {
                                            indentCases = hasExpectedIndent;
                                            if (!indentCases) {
                                                indent--;
                                                expectedIndent--;
                                            }
                                        }

                                    // Handling functions in expressions (with unclear initial indent).
                                    } else if (calculateFunctionExpressionIndent) {
                                        indent = Math.max(indent, Math.floor(line.length / this._indentSize));
                                        expectedIndent = indent;
                                        calculateFunctionExpressionIndent = false;
                                    }
                                }

                                // Allowing "break" statement have lesser indentation.
                                if (parentElement.type === 'SwitchCase' && nextSibling.type === 'BreakStatement') {
                                    if (this._indentBreaks === null) {
                                        this._indentBreaks = hasExpectedIndent;
                                    }
                                    if (!this._indentBreaks) {
                                        expectedIndent--;
                                    }
                                }
                            }

                            var expectedLineLengths = [expectedIndent * this._indentSize];

                            // Excluding comments if necessary.
                            if (isLastLine && nextSibling && nextSibling.isComment) {
                                if (this._exceptComments) {
                                    break;
                                }
                                if (isSwitchStatement && indentCases) {
                                    expectedLineLengths.push(expectedLineLengths[0] + this._indentSize);
                                }
                                var brace = nextSibling.getNextNonWhitespaceToken();
                                if (isBlock && brace === parentElement.lastChild && hasFollowingClause(parentElement)) {
                                    expectedLineLengths.push(expectedLineLengths[0] - this._indentSize);
                                }
                            }

                            if (expectedLineLengths.indexOf(line.length) === -1) {
                                errors.cast({
                                    message: 'Expected indentation of ' + expectedLineLengths[0] + ' characters',
                                    element: element,
                                    offset: lines[i].offset,
                                    additional: {
                                        line: lineOffset + i,
                                        indentDiff: expectedLineLengths[0] - line.length,
                                        adjustElement: isLastLine && nextSibling
                                    }
                                });
                            }
                        }
                    }
                }
            } else {
                this._checkNode(element, errors, indent, options);
            }
            element = element.nextSibling;
        }
    },

    check: function(file, errors) {
        var program = file.getProgram();
        var firstWhitespace;
        if (program.getFirstToken().isWhitespace) {
            firstWhitespace = program.getFirstToken();
        }
        this._checkNode(program, errors, 0, {
            moduleBody: getModuleBody(program),
            firstWhitespace: firstWhitespace
        });
    },

    _fix: function(file, error) {
        var indentChar = this._indentChar;
        var whitespaceToken = error.element;

        var fixData = error.additional;
        var indentDiff = fixData.indentDiff;

        var lineItemsData = getLineData(whitespaceToken.value);
        var lineItemToFix = lineItemsData[fixData.line];
        if (lineItemToFix) {
            var originalIndentLength = lineItemToFix.line.length;
            var finalIndentLength = originalIndentLength + indentDiff;
            lineItemToFix.line = new Array(finalIndentLength + 1).join(indentChar);
            var newWhitespaceToken = new cst.Token(
                'Whitespace',
                convertLinesToString(lineItemsData)
            );
            whitespaceToken.parentElement.replaceChild(newWhitespaceToken, whitespaceToken);

            var adjustElement = fixData.adjustElement;
            if (adjustElement && adjustElement.getNewlineCount() > 0) {
                var currentToken = adjustElement.getFirstToken();
                var lastToken = adjustElement.getLastToken();
                while (true) {
                    var nextToken = currentToken.getNextToken();
                    if (currentToken.isWhitespace && currentToken.getNewlineCount() > 0) {
                        var newSubWhitespaceToken = new cst.Token(
                            currentToken.type,
                            applyIndentationDiff(currentToken.value, indentDiff, indentChar, this._includeEmptyLines)
                        );
                        currentToken.parentElement.replaceChild(newSubWhitespaceToken, currentToken);
                    }
                    if (currentToken.isComment && currentToken.getNewlineCount() > 0) {
                        var prev = currentToken.getPreviousToken();
                        var commentIndent = 0;
                        if (prev.isWhitespace && prev.getNewlineCount() > 0) {
                            commentIndent = prev.getSourceCodeLines().concat().pop().length;
                        }
                        var commentDiff = indentDiff < 0 && commentIndent < -indentDiff ?
                            -commentIndent :
                            indentDiff;
                        var newCommentToken = new cst.Token(
                            currentToken.type,
                            applyIndentationDiff(
                                currentToken.value,
                                commentDiff,
                                indentChar,
                                this._includeEmptyLines
                            )
                        );
                        currentToken.parentElement.replaceChild(newCommentToken, currentToken);
                    }
                    if (currentToken === lastToken) {
                        break;
                    }
                    currentToken = nextToken;
                }
            }
        }
    }
};
