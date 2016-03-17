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
                if (
                    property.type === 'ObjectMethod' &&
                    (property.kind === 'get' || property.kind === 'set')
                ) {
                    return;
                }

                if (property.shorthand ||
                    property.type === 'SpreadProperty') {
                    return;
                }

                var token = file.getLastNodeToken(property.key);

                if (property.computed === true) {
                    token = file.getNextToken(token);
                }

                errors.assert.whitespaceBetween({
                    token: token,
                    nextToken: file.getNextToken(token),
                    message: 'Missing space after key'
                });
            });
        });
    }

};
