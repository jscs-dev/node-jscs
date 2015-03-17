/**
 * Requires newline inside curly braces of all objects.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requirePaddingNewLinesInObjects": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = {
 *     a: 1
 * };
 * foo({
 *     a: {
 *         b: 1
 *     }
 * });
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = { a: 1 };
 * foo({a:{b:1}});
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            typeof value === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            value === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requirePaddingNewLinesInObjects';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getNextToken(openingBracket);

            if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                return;
            }

            errors.assert.differentLine({
                token: openingBracket,
                nextToken: nextToken,
                message: 'Missing newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);

            errors.assert.differentLine({
                token: file.getPrevToken(closingBracket),
                nextToken: closingBracket,
                message: 'Missing newline before closing curly brace'
            });
        });
    }

};
