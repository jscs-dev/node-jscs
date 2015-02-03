/**
 * Disallows space after object keys.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceAfterObjectKeys": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = {a: 1};
 * ```
 * ##### Invalid
 * ```js
 * var x = {a : 1};
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                if (property.shorthand) {
                    return;
                }

                var token = file.getFirstNodeToken(property.key);
                errors.assert.noWhitespaceBetween({
                    token: token,
                    nextToken: file.getNextToken(token),
                    message: 'Illegal space after key',
                    disallowNewLine: true
                });
            });
        });
    }

};
