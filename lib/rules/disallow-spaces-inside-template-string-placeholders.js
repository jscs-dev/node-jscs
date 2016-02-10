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
            var first = file.getFirstNodeToken(node);
            var nextFist = file.getNextToken(first, {includeWhitespace: true});
            var last = file.getLastNodeToken(node);
            var prevLast = file.getPrevToken(last, {includeWhitespace: true});

            if (nextFist.isWhitespace) {
                errors.assert.noWhitespaceBetween({
                    token: first,
                    nextToken: file.getNextToken(first),
                    message: 'Illegal space after "${"'
                });
            }

            if (prevLast.isWhitespace) {
                errors.assert.noWhitespaceBetween({
                    token: file.getPrevToken(last),
                    nextToken: last,
                    message: 'Illegal space before "}"'
                });
            }
        });
    }
};
