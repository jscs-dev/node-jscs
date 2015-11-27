/**
 * Requires to return early in a function.
 *
 * Types: `String`
 *
 * Values:
 *  - `noElse`: disallow to use of else if the corrisponding `if` block contain a return.
 *
 * #### Example
 *
 * ```js
 * "requireEarlyReturn": "noElse"
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function test() {
 *     if (x) {
 *         return x;
 *     }
 *     return y;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * function test() {
 *     if (x) {
 *         return x;
 *     } else {
 *         return y;
 *     }
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === 'noElse',
            this.getOptionName() + ' option allow only the `noElse` value'
        );
    },

    getOptionName: function() {
        return 'requireEarlyReturn';
    },

    check: function(file, errors) {
        function addError(entity) {
            errors.add(
                'Use of else after return',
                entity.loc.start.line,
                entity.loc.start.column
            );
        }

        function hasNodeReturn(node) {
            if (node.type === 'BlockStatement') {
                for (var i = node.body.length - 1; i >= 0; i--) {
                    if (node.body[i].type === 'ReturnStatement') {
                        return true;
                    }
                }
                return false;
            }
            return node.type === 'ReturnStatement';
        }

        file.iterateNodesByType('IfStatement', function(node) {
            if (!node.alternate) {
                return;
            }

            // Check if all the parents have a return statement, if not continue to the following IfStatement node.
            for (var nodeIf = node; nodeIf && nodeIf.type === 'IfStatement'; nodeIf = nodeIf.parentNode) {
                if (nodeIf.alternate && !hasNodeReturn(nodeIf.consequent)) {
                    return;
                }
            }

            return addError(node.alternate);
        });
    }
};
