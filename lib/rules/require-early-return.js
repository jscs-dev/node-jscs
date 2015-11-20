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

        file.iterateNodesByType('IfStatement', function(node) {
            if (!node.alternate) {
                return;
            }

            var ifBranch = node.consequent;
            if (ifBranch.type === 'ReturnStatement') {
                return addError(node.alternate);
            }

            if (ifBranch.type === 'BlockStatement') {
                for (var i = ifBranch.body.length - 1; i >= 0; i--) {
                    if (ifBranch.body[i].type === 'ReturnStatement') {
                        return addError(node.alternate);
                    }
                }
            }
        });
    }
};
