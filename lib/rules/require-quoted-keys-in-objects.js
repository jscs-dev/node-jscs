/**
 * Requires quoted keys in objects.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requiresQuotedKeysInObjects": true
 * ```
 *
 * ##### Valid
 *
 * ```js
  * var x = { 'a': { "default": 1 } };
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = { a: 1 };
 * ```
 */

var assert = require('assert');

module.exports = function() { };

module.exports.prototype = {

    configure: function(requireQuotedKeysInObjects) {
        assert(
            requireQuotedKeysInObjects === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireQuotedKeysInObjects';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                if (prop.shorthand || prop.method || prop.kind !== 'init') {
                    return;
                }

                var key = prop.key;
                if (!(typeof key.value === 'string' && key.type === 'Literal')) {
                    errors.add('Object key without surrounding quotes', prop.loc.start);
                }
            });
        });
    }
};
