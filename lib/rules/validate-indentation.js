/**
 * Validates indentation for switch statements and block statements
 *
 * Type: `Integer` or `String` or `Object`
 *
 * Values:
 *  - `Integer`: A positive number of spaces
 *  - `String`: `"\t"` for tab indentation
 *  - `Object`:
 *     - `value`: (required) the same effect as the non-object values
 *     - `includeEmptyLines`: (default: `false`) require empty lines to be indented
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
 * ##### Valid example for mode `{ "value": "\t", "includeEmptyLines": true }`
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
 * ##### Invalid example for mode `{ "value": "\t", "includeEmptyLines": true }`
 * ```js
 * if (a) {
 *     b=c;
 *     function(d) {
 *         e=f;
 *     }
 *
 * } // no tab character on previous line
 * ```
 */

var assert = require('assert');
var utils = require('../utils');

var blockParents = [
    'IfStatement',
    'WhileStatement',
    'DoWhileStatement',
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowExpression',
    'CatchClause',
];

var indentableNodes = {
    BlockStatement: 'body',
    Program: 'body',
    ObjectExpression: 'properties',
    ArrayExpression: 'elements',
    SwitchStatement: 'cases',
    SwitchCase: 'consequent'
};

module.exports = function() {};

module.exports.prototype = {

    configure: function(validateIndentation) {
        this._includeEmptyLines = false;

        if (typeof validateIndentation === 'object') {
            this._includeEmptyLines = (validateIndentation.includeEmptyLines === true);
            validateIndentation = validateIndentation.value;
        }

        assert(
            validateIndentation === '\t' ||
                (typeof validateIndentation === 'number' && validateIndentation > 0),
            'validateIndentation option requires a positive number of spaces or "\\t"' +
            ' or options object with "value" property'
        );

        if (typeof validateIndentation === 'number') {
            this._indentChar = ' ';
            this._indentSize = validateIndentation;
        } else {
            this._indentChar = '\t';
            this._indentSize = 1;
        }

        this._breakIndents = null;
        this._moduleIndents = null;
    },

    getOptionName: function() {
        return 'validateIndentation';
    },

    check: function(file, errors) {
        function markCheckLine(line) {
            linesToCheck[line].check = true;
        }

        function markCheck(node) {
            markCheckLine(node.loc.start.line - 1);
        }

        function markEndCheck(node) {
            markCheckLine(node.loc.end.line - 1);
        }

        function markPush(node, indents) {
            linesToCheck[node.loc.start.line - 1].push.push(indents);
        }

        function markPop(node, outdents) {
            linesToCheck[node.loc.end.line - 1].pop.push(outdents);
        }

        function markPushAlt(node) {
            linesToCheck[node.loc.start.line - 1].pushAltLine.push(node.loc.end.line - 1);
        }

        function markCase(caseNode, children) {
            var outdentNode = getCaseOutdent(children);

            if (outdentNode) {
                // If a case statement has a `break` as a direct child and it is the
                // first one encountered, use it as the example for all future case indentation
                if (_this._breakIndents === null) {
                    _this._breakIndents = (caseNode.loc.start.column === outdentNode.loc.start.column) ? 1 : 0;
                }
                markPop(outdentNode, _this._breakIndents);
            } else {
                markPop(caseNode, 0);
            }
        }

        function markChildren(node) {
            getChildren(node).forEach(function(childNode) {
                if (childNode.loc.start.line !== node.loc.start.line) {
                    markCheck(childNode);
                }
            });
        }

        function markAlternateBlockStatement(node, property) {
            var child =  node[property];
            if (child && child.type === 'BlockStatement') {
                markCheck(child);
            }
        }

        function isMultiline(node) {
            return node.loc.start.line !== node.loc.end.line;
        }

        function getCaseOutdent(caseChildren) {
            var outdentNode;
            caseChildren.some(function(node) {
                if (node.type === 'BreakStatement') {
                    outdentNode = node;
                    return true;
                }
            });

            return outdentNode;
        }

        function getBlockNodeToPush(node) {
            var parent = node.parentNode;

            // The parent of an else is the entire if/else block. To avoid over indenting
            // in the case of a non-block if with a block else, mark push where the else starts,
            // not where the if starts!
            if (parent.type === 'IfStatement' && parent.alternate === node) {
                return node;
            }

            // The end line to check of a do while statement needs to be the location of the
            // closing curly brace, not the while statement, to avoid marking the last line of
            // a multiline while as a line to check.
            if (parent.type === 'DoWhileStatement') {
                return node;
            }

            // Detect bare blocks: a block whose parent doesn't expect blocks in its syntax specifically.
            if (blockParents.indexOf(parent.type) === -1) {
                return node;
            }

            return parent;
        }

        function getChildren(node) {
            var childrenProperty = indentableNodes[node.type];
            return node[childrenProperty];
        }

        function getIndentationFromLine(i) {
            var rNotIndentChar = new RegExp('[^' + indentChar + ']');
            var firstContent = lines[i].search(rNotIndentChar);
            if (firstContent === -1) {
                firstContent = lines[i].length;
            }
            return firstContent;
        }

        function checkIndentations() {
            linesToCheck.forEach(function(line, i) {
                var actualIndentation = getIndentationFromLine(i);
                var expectedIndentation = getExpectedIndentation(line, actualIndentation);

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

                if (line.push.length) {
                    pushExpectedIndentations(line, actualIndentation);
                }
            });
        }

        function getExpectedIndentation(line, actual) {
            var outdent = indentSize * Math.max.apply(null, line.pop);

            var idx = indentStack.length - 1;
            var expected = indentStack[idx];

            if (!Array.isArray(expected)) {
                expected = [expected];
            }

            expected = expected.map(function(value) {
                if (line.pop.length) {
                    value -= outdent;
                }

                return value;
            }).reduce(function(previous, current) {
                // when the expected is an array, resolve the value
                // back into a Number by checking both values are the actual indentation
                return actual === current ? current : previous;
            });

            indentStack[idx] = expected;

            line.pop.forEach(function() {
                indentStack.pop();
            });

            return expected;
        }

        function pushExpectedIndentations(line, actualIndentation) {
            var indents = Math.max.apply(null, line.push);

            var expected = actualIndentation + (indentSize * indents);

            // when a line has alternate indentations, push an array of possible values
            // on the stack, to be resolved when checked against an actual indentation
            if (line.pushAltLine.length) {
                expected = [expected];
                line.pushAltLine.forEach(function(altLine) {
                    expected.push(getIndentationFromLine(altLine) + (indentSize * indents));
                });
            }

            line.push.forEach(function() {
                indentStack.push(expected);
            });
        }

        function setModuleBody(node) {
            if (node.body.length !== 1 || node.body[0].type !== 'ExpressionStatement' ||
                node.body[0].expression.type !== 'CallExpression') {
                return;
            }

            var callExpression = node.body[0].expression;
            var callee = callExpression.callee;
            var callArgs = callExpression.arguments;
            var iffeFunction = utils.getFunctionNodeFromIIFE(callExpression);

            if (iffeFunction) {
                if (callArgs.length === 1 && callArgs[0].type === 'FunctionExpression') {
                    // detect UMD Shim, where the file body is the body of the factory,
                    // which is the sole argument to the IIFE
                    moduleBody = callArgs[0].body;
                } else {
                    // full file IIFE
                    moduleBody = iffeFunction.body;
                }
            }

            // detect require/define
            if (callee.type === 'Identifier' && callee.name.match(/^(require|define)$/)) {
                // the define callback is the *first* functionExpression encountered,
                // as it can be the first, second, or third argument.
                callArgs.some(function(argument) {
                    if (argument.type === 'FunctionExpression') {
                        moduleBody = argument.body;
                        return true;
                    }
                });
            }

            // set number of indents for modules by detecting
            // whether the first statement is indented or not
            if (moduleBody && moduleBody.body.length) {
                _this._moduleIndents = moduleBody.body[0].loc.start.column > 0 ? 1 : 0;
            }
        }

        function generateIndentations() {
            file.iterateNodesByType('Program', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                setModuleBody(node);
                markChildren(node);
            });

            file.iterateNodesByType('BlockStatement', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                var indents = node === moduleBody ? _this._moduleIndents : 1;

                markChildren(node);
                markPop(node, indents);
                markPush(getBlockNodeToPush(node), indents);
                markEndCheck(node);
            });

            file.iterateNodesByType('IfStatement', function(node) {
                markAlternateBlockStatement(node, 'alternate');
            });

            file.iterateNodesByType('TryStatement', function(node) {
                markAlternateBlockStatement(node, 'handler');
                markAlternateBlockStatement(node, 'finalizer');
            });

            file.iterateNodesByType('SwitchStatement', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                var indents = 1;
                var children = getChildren(node);

                if (node.loc.start.column === children[0].loc.start.column) {
                    indents = 0;
                }

                markChildren(node);
                markPop(node, indents);
                markPush(node, indents);
                markEndCheck(node);
            });

            file.iterateNodesByType('SwitchCase', function(node) {
                if (!isMultiline(node)) {
                    return;
                }

                var children = getChildren(node);

                if (children.length === 1 && children[0].type === 'BlockStatement') {
                    return;
                }

                markPush(node, 1);
                markCheck(node);
                markChildren(node);

                markCase(node, children);
            });

            // indentations inside of function expressions can be offset from
            // either the start of the function or the end of the function, therefore
            // mark all starting lines of functions as potential indentations
            file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
                markPushAlt(node);
            });

            if (_this._includeEmptyLines) {
                file.getLines().forEach(function(line, i) {
                    if (line.match(/^\s*$/)) {
                        linesToCheck[i].check = true;
                    }
                });
            }
        }

        var _this = this;

        var moduleBody;

        var indentChar = this._indentChar;
        var indentSize = this._indentSize;

        var lines = file.getLinesWithCommentsRemoved(errors);
        var indentStack = [0];
        var linesToCheck = lines.map(function() {
            return {
                push: [],
                pushAltLine: [],
                pop: [],
                check: false
            };
        });

        generateIndentations();
        checkIndentations();
    }

};
