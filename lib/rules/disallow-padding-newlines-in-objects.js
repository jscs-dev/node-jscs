/**
 * Disallows newline inside curly braces of all objects.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowPaddingNewLinesInObjects": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = { a: 1 };
 * foo({a: {b: 1}});
 * ```
 *
 * ##### Invalid
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
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        assert(
            value === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowPaddingNewLinesInObjects';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ObjectExpression', function(node) {
            var openingBracket = file.getFirstNodeToken(node);
            var nextToken = file.getNextToken(openingBracket);

            if (nextToken.type === 'Punctuator' && nextToken.value === '}') {
                return;
            }

            errors.assert.sameLine({
                token: openingBracket,
                nextToken: nextToken,
                message: 'Illegal newline after opening curly brace'
            });

            var closingBracket = file.getLastNodeToken(node);

            errors.assert.sameLine({
                token: file.getPrevToken(closingBracket),
                nextToken: closingBracket,
                message: 'Illegal newline before closing curly brace'
            });
        });
    }

};
