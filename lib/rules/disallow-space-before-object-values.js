/**
 * Disallows space after object keys.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeObjectValues": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = {a:1};
 * ```
 * ##### Invalid
 * ```js
 * var x = {a: 1};
 * ```
 */

var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            disallow === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeObjectValues';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                if (property.shorthand || property.method || property.kind !== 'init' ||
                    utils.getBabelType(property) === 'SpreadProperty') {
                    return;
                }

                var keyToken = file.getFirstNodeToken(property.key);
                var colon = file.findNextToken(keyToken, 'Punctuator', ':');

                errors.assert.noWhitespaceBetween({
                    token: colon,
                    nextToken: file.getNextToken(colon),
                    message: 'Illegal space after key colon'
                });
            });
        });
    }

};
