/**
 * Disallows newline inside curly braces of all objects.
 *
 * Type: `Boolean`
 *
 * Values: `true`
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
            typeof value === 'boolean',
            'disallowPaddingNewLinesInObjects option requires boolean value'
        );
        assert(
            value === true,
            'disallowPaddingNewLinesInObjects option requires true value or should be removed'
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
            var prevToken = file.getPrevToken(closingBracket);

            errors.assert.sameLine({
                token: prevToken,
                nextToken: closingBracket,
                message: 'Illegal newline before closing curly brace'
            });
        });
    }

};
