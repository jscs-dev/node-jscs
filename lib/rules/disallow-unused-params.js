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

function isUsed(scope, name) {
    var arg;

    // Use for loop for early return;
    for (var i = 0; i < scope.variables.length; i++) {
        if (scope.variables[i].name === name) {
            return !!scope.variables[i].references.length;
        }
    }
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
        return 'disallowUnusedArguments';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
            var scope = file.getScope().acquire(node);
            var params = node.params;

            params.forEach(function(value, index) {
                if (isUsed(scope, value.name)) {
                    return;
                }

                errors.cast({
                    message: 'Argument ' + value.name + ' is not used',
                    line: params[index].loc.start.line,
                    column: params[index].loc.start.column,
                    additional: {
                        node: params[index],
                        token: file.getFirstNodeToken(params[index])
                    }
                });
            });
        });
    },

    _fix: function(file, error) {
        var node = error.additional.node;
        var parent = node.parentNode;

        var index = parent.params.indexOf(node);
        var length = parent.params.length;

        var token = error.additional.token;
        var tokens = file.getTokens();

        var next;

        if (parent.params[index + 1]) {
            next = file.findNextToken(token, 'Identifier');
        }

        // For "b"

        // function test(b) {}
        if (length === 1) {
            file.removeToken(token);

            return;
        }

        // function test(a, b) {}
        if (length > 1 && index + 1 === length) {
            file.removeToken(file.findPrevToken(token, 'Punctuator', ','))
            file.removeToken(token);

            return;
        }

        // function test(b, c) {}
        if (length > 1) {
            file.removeToken(file.findNextToken(token, 'Punctuator', ','));
            file.removeToken(token);
            next.whitespaceBefore = '';

            return;
        }
    }
};
