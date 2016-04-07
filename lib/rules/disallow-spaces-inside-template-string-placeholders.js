/**
 * Disallows spaces before and after curly brace inside template string placeholders.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInsideTemplateStringPlaceholders": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * `Hello ${name}!`
 * ```
 *
 * ##### Invalid for mode `true`
 *
 * ```js
 * `Hello ${ name}!`
 * `Hello ${name }!`
 * `Hello ${ name }!`
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
        return 'disallowSpacesInsideTemplateStringPlaceholders';
    },

    check: function(file, errors) {
        file.iterateNodesByType('TemplateLiteral', function(node) {
            node.childElements
                .filter(function(element) {
                    return element.isToken && element.type === 'Punctuator';
                })
                .forEach(function(element) {
                    if (element.value === '${' && element.nextSibling.isWhitespace) {
                        errors.assert.noWhitespaceBetween({
                            token: element,
                            nextToken: element.getNextCodeToken(),
                            message: 'Illegal space after "${"'
                        });
                    }
                    if (element.value === '}' && element.previousSibling.isWhitespace) {
                        errors.assert.noWhitespaceBetween({
                            token: element.getPreviousCodeToken(),
                            nextToken: element,
                            message: 'Illegal space before "}"'
                        });
                    }
                });
        });
    }
};
