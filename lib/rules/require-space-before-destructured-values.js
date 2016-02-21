/**
 * Require space after colon in object destructuring.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * Version: `ES6`
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBeforeDestructuredValues": true
 * ```
 *
 * ##### Valid
 * ```js
 * const { foo: objectsFoo } = SomeObject;
 * ```
 * ##### Invalid
 * ```js
 * const { foo:objectsFoo } = SomeObject;
 * ```
 *
 * ##### Valid
 * ```js
 * const { [ { foo: objectsFoo } ] } = SomeObject;
 * ```
 * ##### Invalid
 * ```js
 * const { [ { foo:objectsFoo } ] } = SomeObject;
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
        return 'requireSpaceBeforeDestructuredValues';
    },

    check: function(file, errors) {

        var checkProperties = function(type, properties) {
            if (type !== 'ObjectPattern') {
                return;
            }

            properties.forEach(function(property) {
                if (property.shorthand || property.method || property.kind !== 'init') {
                    return;
                }

                var keyToken = file.getFirstNodeToken(property.key);
                var colon    = file.findNextToken(keyToken, 'Punctuator', ':');

                errors.assert.whitespaceBetween({
                    token: colon,
                    nextToken: file.getNextToken(colon),
                    message: 'Missing space after key colon'
                });

                //Strategy for nested structures
                var propValue = property.value;

                if (!propValue) {
                    return;
                }

                if (propValue.type === 'ArrayPattern') {
                    propValue.elements.forEach(function(element) {
                        checkProperties(element.type, element.properties);
                    });

                    return;
                }

                if (propValue.type === 'ObjectPattern') {
                    checkProperties(propValue.type, propValue.properties);
                }
            });
        };

        file.iterateNodesByType('VariableDeclaration', function(node) {
            node.declarations.forEach(function(declaration) {

                var declarationId = declaration.id || {};

                checkProperties(declarationId.type, declarationId.properties);
            });
        });
    }
};
