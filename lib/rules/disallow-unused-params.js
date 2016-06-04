/**
 * Disallows unused params in function expression and function declaration.
 *
 * Types: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowUnusedParams": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function x(test) {
 *     return test;
 * }
 *
 * var x = function(test) {
 *     return test;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
  * function x(test) {
 * }
 *
 * var x = function(test) {
 * }
 * ```
 */

var assert = require('assert');

function getUnusedNodes(node, variableMap, groupIfPossible) {
    if (node.type === 'AssignmentPattern') {
        return getUnusedNodes(node.left, variableMap, groupIfPossible);
    }

    if (node.type === 'Identifier') {
        var variable = variableMap[node.name];

        var hasUsages = variable.getReferences().some(function(reference) {
            return !variable.getDefinitions().some(function(definition) {
                return reference.node === definition.node;
            });
        });

        if (hasUsages) {
            return [];
        }

        return [node];
    }

    if (node.type === 'RestElement') {
        var restUnusedNodes = getUnusedNodes(node.argument, variableMap, groupIfPossible);
        if (groupIfPossible && restUnusedNodes.length === 1 && node.argument === restUnusedNodes[0]) {
            return [node];
        }
        return restUnusedNodes;
    }

    if (node.type === 'ArrayPattern') {
        var unusedArrayNodes = [];
        node.elements.forEach(function(element) {
            if (element) {
                unusedArrayNodes = unusedArrayNodes.concat(getUnusedNodes(element, variableMap, groupIfPossible));
                return;
            }
            unusedArrayNodes.push(null);
        });
        if (groupIfPossible && unusedArrayNodes.length === node.elements.length) {
            if (node.elements.every(function(element, index) {
                return unusedArrayNodes[index] === element;
            })) {
                return [node];
            }
        }
        return unusedArrayNodes.filter(function(node) { return node; });
    }

    if (node.type === 'ObjectPattern') {
        var unusedObjectNodes = [];
        node.properties.forEach(function(property) {
            unusedObjectNodes = unusedObjectNodes.concat(getUnusedNodes(property.value, variableMap, groupIfPossible));
        });
        if (groupIfPossible && unusedObjectNodes.length === node.properties.length) {
            if (node.properties.every(function(property, index) {
                return unusedObjectNodes[index] === property.value;
            })) {
                return [node];
            }
        }
        return unusedObjectNodes;
    }

    return [];
}

function isComma(token) {
    return token.type === 'Punctuator' && token.value === ',';
}

function removeWithCommaIfNecessary(node, removeForwards) {
    var previousCodeToken = node.getPreviousCodeToken();
    if (isComma(previousCodeToken)) {
        node.parentElement.removeChildren(previousCodeToken, node);
        return;
    }

    var nextCodeToken = node.getNextCodeToken();
    if (removeForwards && isComma(nextCodeToken)) {
        node.parentElement.removeChildren(node, nextCodeToken);
        return;
    }

    var previousNode = node;
    while (previousNode.previousSibling.isToken && !previousNode.previousSibling.isCode) {
        previousNode = previousNode.previousSibling;
    }
    var nextNode = node;
    while (nextNode.nextSibling.isToken && !nextNode.nextSibling.isCode) {
        nextNode = nextNode.nextSibling;
    }

    node.parentElement.removeChild(previousNode, nextNode);
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowUnusedParams';
    },

    check: function(file, errors) {

        function reportError(node) {
            if (node.type === 'Identifier') {
                errors.add('Param `' + node.name + '` is not used', node);
            } else {
                errors.add('Pattern is not used', node);
            }
        }

        file.iterateNodesByType(
            ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'],
            function(node) {
                var variableMap = file.getScopes().acquire(node).getVariables()
                    .filter(function(variable) {
                        return variable.type === 'Parameter';
                    })
                    .reduce(function(obj, variable) {
                        obj[variable.name] = variable;
                        return obj;
                    }, {});

                var params = node.params;
                var reportUnusedDirectParams = true;

                for (var i = params.length - 1; i >= 0; i--) {
                    var param = params[i];

                    if (!reportUnusedDirectParams && param.type === 'Identifier') {
                        continue;
                    }

                    var unusedNodes = getUnusedNodes(param, variableMap, reportUnusedDirectParams);

                    unusedNodes.forEach(reportError);

                    if (unusedNodes.length !== 1 || unusedNodes[0] !== param) {
                        reportUnusedDirectParams = false;
                    }
                }
            }
        );
    },

    _fix: function(file, error) {
        var node = error.element;

        var parentElement = node.parentElement;
        if (!parentElement) {
            return;
        }

        if (
            parentElement.type === 'FunctionExpression' ||
            parentElement.type === 'FunctionDeclaration' ||
            parentElement.type === 'ArrowFunctionExpression'
        ) {
            removeWithCommaIfNecessary(node, false);
            return;
        }

        if (parentElement.type === 'ObjectProperty') {
            removeWithCommaIfNecessary(parentElement, true);
            return;
        }

        if (parentElement.type === 'ArrayPattern') {
            removeWithCommaIfNecessary(node, false);
            if (
                parentElement.elements.length > 0 &&
                parentElement.elements.every(function(element) {
                    return !element;
                })
            ) {
                parentElement.removeChildren(
                    parentElement.firstChild.nextSibling,
                    parentElement.lastChild.previousSibling
                );
            }
        }
    }
};
