/**
 * Disallows unused variables defined with var, let or const.
 *
 * Types: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowUnusedVariables": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x=1;
 *
 * function getX() {
 *     return x;
 * }
 *
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x=1;
 *
 * function getX() {
 *     return true;
 * }
 *
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowUnusedVariables';
    },

    check: function(file, errors) {
        var program = file.getProgram();
        var variableList = [];
        var nodesToCheck = [];
        var unusedNodes = [];

        function reportError(node) {
            errors.add('Variable `' + node.name + '` is not used', node);
        }

        function isVariableGood(variable) {
            var parentCheck = function(node) {
                if (node.parentElement) {
                    if (node.parentElement.type === 'VariableDeclaration') {
                        var grandparentElement = node.parentElement.parentElement;

                        return grandparentElement.type !== 'ExportNamedDeclaration';
                    } else if (
                        node.parentElement.type === 'VariableDeclarator' ||
                        node.parentElement.type === 'ObjectProperty' ||
                        node.parentElement.isPattern
                    ) {
                        return parentCheck(node.parentElement);
                    }
                } else {
                    return false;
                }
            };

            var useVariable = variable.getDefinitions().some(function checkVariableDefinition(definition) {
                return parentCheck(definition.node);
            });

            return useVariable;
        }

        function getVariablesInAllScopes(scope) {
            var variableList = [];

            var iterateChildScopes = function(scope) {
                scope.getVariables().forEach(function(variable) {
                    variableList.push(variable);
                });

                scope.childScopes.forEach(function(childScope) {
                    return iterateChildScopes(childScope);
                });
            };

            iterateChildScopes(scope);

            return variableList;
        }

        // Get all variables in all scopes.
        variableList = getVariablesInAllScopes(file.getScopes().acquire(program));

        // Check if variables are what we want to check..
        variableList.reduce(function(acc, variable) {
            if (isVariableGood(variable)) {
                acc.push(variable);
            }

            return acc;
        }, nodesToCheck);

        // Check if variables are used.
        nodesToCheck.reduce(function checkVariableReferences(acc, variable) {
            if (variable.getReferences().length === 1) {
                variable.getDefinitions().forEach(function addUnusedVariable(definition) {
                    acc.push(definition.node);
                });
            }

            return acc;
        }, unusedNodes);

        unusedNodes.forEach(reportError);
    },

    _fix: function(file, error) {
        var node = error.element;

        while (node.type !== 'VariableDeclaration') {
            node = node.parentElement;
        }

        node.parentElement.removeChild(node);
        error.fixed = true;
    }
};
