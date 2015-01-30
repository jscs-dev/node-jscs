/**
 * Requires space after object keys.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBeforeObjectValues": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = {a: 1};
 * ```
 * ##### Invalid
 * ```js
 * var x = {a:1};
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
        return 'requireSpaceBeforeObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var keyToken = file.getFirstNodeToken(property.key);
                var colon = file.findNextToken(keyToken, 'Punctuator', ':');

                errors.assert.whitespaceBetween({
                    token: colon,
                    nextToken: file.getNextToken(colon),
                    message: 'Missing space after key colon'
                });
            });
        });
    }

};
