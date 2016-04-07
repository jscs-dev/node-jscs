/**
 * Disallows placing object keys on new line
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowObjectKeysOnNewLine": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = {
 *     b: 'b', c: 'c'
 * };
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = {
 *     b: 'b',
 *     c: 'c'
 * };
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
        return 'disallowObjectKeysOnNewLine';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var properties = node.properties;
            for (var i = 1; i < properties.length; i++) {
                var propertyNode = properties[i];

                errors.assert.sameLine({
                    token: propertyNode.getPreviousCodeToken(),
                    nextToken: propertyNode.getFirstToken(),
                    message: 'Object keys must go on a new line'
                });
            }
        });
    }
};
