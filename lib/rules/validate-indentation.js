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
            return new Array(getLengthFromIndentation(i) + 1).join(indentChar);
        }

        function getLengthFromIndentation(i) {
            return indentSize * lineIndentation[i];
        }

        function getIndentationFromLine(i) {
            var rNotIndentChar = new RegExp('[^' + indentChar + ']');
            var firstContent = Math.max(lines[i].search(rNotIndentChar), 0);
            return firstContent / indentSize;
        }

        function markLinesToCheck(node, childrenProperty) {
            var children = node[childrenProperty];

            children.forEach(function(childNode) {
                linesToCheck[childNode.loc.start.line - 1] = true;
            });

            linesToCheck[node.parentNode.loc.start.line - 1] = true;
            linesToCheck[node.loc.end.line - 1] = true;
        }

        function addContentIndentation(node, count, includeLastLine) {
            var end = node.loc.end.line;
            if (includeLastLine) {
                end++;
            }
            for (var x = node.loc.start.line + 1; x < end; x++) {
                lineIndentation[x - 1] += count;
            }
        }

        function checkIndentation(i) {
            var line = lines[i];
            var indentLength = getLengthFromIndentation(i);

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
                    addContentIndentation(node, 1);
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
                    addContentIndentation(node, 1);
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
                    addContentIndentation(node, 1, true);
                }
            });

            file.iterateNodesByType('CallExpression', function (node) {
                if (!isMultiline(node)) {
                    return;
                }

                var argumentsIndentation;
                var nodeStartLine = node.loc.start.line - 1;
                var calleeEndLine = node.callee.loc.end.line - 1;
                var nodeEndLine = node.loc.end.line - 1;
                var nodeIndentation = getIndentationFromLine(nodeStartLine);

                node.arguments.forEach(function (argument, i) {
                    var startLine = argument.loc.start.line - 1;
                    // Check if this argument starts on a new line
                    if (startLine > calleeEndLine &&
                            (i === 0 || startLine > node.arguments[i - 1].loc.end.line - 1)) {

                        // Get the indentation of the first argument. All
                        // future arguments starting a new line should have this
                        // indentation
                        if (argumentsIndentation === undefined) {
                            argumentsIndentation = getIndentationFromLine(startLine) - nodeIndentation;
                        }

                        linesToCheck[startLine] = true;
                        lineIndentation[startLine] += argumentsIndentation;
                        addContentIndentation(argument, argumentsIndentation, true);
                    }
                });

                // If the call expression does not end on the same line as the
                // last argument, check if it has the same indentation as the
                // call start
                var lastArgument = node.arguments[node.arguments.length - 1];
                if (nodeEndLine > calleeEndLine && (!lastArgument || nodeEndLine > lastArgument.loc.end.line - 1)) {
                    linesToCheck[nodeEndLine] = true;
                    lineIndentation[nodeEndLine] = nodeIndentation;
                }
            });

            // VariableDeclarator must come last,
            // as it unmarks lines for indentation, which needs to happen after all lines have been marked
            file.iterateNodesByType([
                'VariableDeclarator'
            ], function (node) {
                if (node.loc.start.line === node.parentNode.loc.start.line || !node.init) {
                    return;
                }

                var startLine = node.loc.start.line - 1;

                linesToCheck[startLine] = false;
                var additionalIndents = getIndentationFromLine(startLine) - lineIndentation[startLine];

                addContentIndentation(node, additionalIndents, true);
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
