/**
 * Requires space after object keys.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSpaceAfterObjectKeys": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = {a : 1};
 * ```
 * ##### Invalid
 * ```js
 * var x = {a: 1};
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
        return 'requireSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                if (property.shorthand || property.method || property.kind !== 'init') {
                    return;
                }

                var token = file.getFirstNodeToken(property.key);
                errors.assert.whitespaceBetween({
                    token: token,
                    nextToken: file.getNextToken(token),
                    message: 'Missing space after key'
                });
            });
        });
    }

};
