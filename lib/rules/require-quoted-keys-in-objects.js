/**
 * Requires quoted keys in objects.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "requireQuotedKeysInObjects": true
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
var cst = require('cst');

module.exports = function() { };

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireQuotedKeysInObjects';
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

                if (property.shorthand || property.method ||
                    node.type === 'SpreadProperty') {
                    return;
                }

                var key = property.key;
                if (key && !(typeof key.value === 'string' && key.type.indexOf('Literal') > -1)) {
                    errors.cast({
                        message: 'Object key without surrounding quotes',
                        element: property.firstChild
                    });
                }
            });
        });
    },

    _fix: function(file, error) {
        var element = error.element.firstChild;
        var newElem = new cst.Token(element.type, '"' + element.getSourceCode() + '"');

        element.parentElement.replaceChild(
            newElem,
            element
        );
    }
};
