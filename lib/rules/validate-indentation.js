var assert = require('assert');
var commentHelper = require('../comment-helper');

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
        this._indentBreak = -1;
        this._indentBreakSwitch = null;

        this._indentableNodes = {
            BlockStatement: 'body',
            Program: 'body',
            ObjectExpression: 'properties',
            ArrayExpression: 'elements',
            SwitchStatement: 'cases',
            SwitchCase: 'consequent',
            BreakStatement: 'break'
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

        function markBreakPop(node, indents) {
            if (indents !== 0) {
                return;
            }

            var loc = node.loc;
            linesToCheck[loc.end.line - 1].popAfter = false;
            var lineBreak = linesToCheck[loc.end.line - 2];

            if (lineBreak.push !== 1) {
                lineBreak.popAfter = true;
            } else {
                lineBreak.push = null;
                lineBreak.popAfter = false;
            }
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
            var childrenProperty = indentableNodes[node.type];
            var children = node[childrenProperty];

            children.forEach(function(childNode, i) {
                if (childNode.loc.start.line !== node.loc.start.line) {
                    linesToCheck[childNode.loc.start.line - 1].check = true;
                }
            });
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

                if (line.popAfter) {
                    indentStack.pop();
                }

                if (line.push !== null) {
                    pushExpectedIndentations(line, actualIndentation);
                }
            });
        }

        function getExpectedIndentation(line, actual) {
            var outdent = indentSize * line.pop;
            var expected;
            var idx = indentStack.length - 1;

            if (line.pop === null) {
                expected = indentStack[idx];
            } else {
                expected = indentStack.pop();

                if (Array.isArray(expected)) {
                    expected[0] -= outdent;
                    expected[1] -= outdent;
                } else {
                    expected -= outdent;
                }
            }

            // when the expected is an array, resolve the value
            // back into a Number by checking both values are the actual indentation
            if (line.check && Array.isArray(expected)) {
                if (actual === expected[1]) {
                    indentStack[idx] = expected[1];
                } else {
                    indentStack[idx] = expected[0];
                }
                expected = indentStack[idx];
            }

            return expected;
        }

        function pushExpectedIndentations(line, actualIndentation) {
            var expectedIndentation = actualIndentation + (indentSize * line.push);
            var expectedIndentation2;

            // when a line has an alternate indentation, push an array of possible values
            // on the stack, to be resolved when checked against an actual indentation
            if (line.pushAltLine !== null) {
                expectedIndentation2 = getIndentationFromLine(line.pushAltLine) + (indentSize * line.push);
                indentStack.push([expectedIndentation, expectedIndentation2]);
            } else {
                indentStack.push(expectedIndentation);
            }
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

                var test = node.test;
                var endLine = test.loc.end.line - 1;

                // Assume that if the test starts on the line following the parens,
                // that the closing parens is on the line after the end of the test.
                if (node.loc.start.line + 1 === test.loc.start.line) {
                    endLine++;
                }

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

            file.iterateNodesByType('BreakStatement', function(node) {
                var caseParent = node.parentNode;
                if (caseParent === null || caseParent.type !== 'SwitchCase') {
                    return;
                }

                var switchParent = caseParent.parentNode;
                if (switchParent === null || switchParent.type !== 'SwitchStatement') {
                    return;
                }

                if (this._indentBreak === -1 || this._indentBreakSwitch !== switchParent) {
                    this._indentBreak = (caseParent.loc.start.column === node.loc.start.column) ? 0 : 1;
                    this._indentBreakSwitch = switchParent;
                }

                markBreakPop(node, this._indentBreak);
            });

            // indentations inside of function expressions can be offset from
            // either the start of the function or the end of the function, therefore
            // mark all starting lines of functions as potential indentations
            file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
                linesToCheck[node.loc.start.line - 1].pushAltLine = node.loc.end.line - 1;
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
                pushAltLine: null,
                pop: null,
                popAfter: null,
                check: null
            };
        });

        generateIndentations();
        checkIndentations();
    }

};
