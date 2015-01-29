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
            'requirePaddingNewLinesInObjects option requires boolean value'
        );
        assert(
            value === true,
            'requirePaddingNewLinesInObjects option requires true value or should be removed'
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

            if (openingBracket.loc.end.line === nextToken.loc.start.line) {
                errors.add('Missing newline after opening curly brace', nextToken.loc.start);
            }

            var closingBracket = file.getLastNodeToken(node);
            var prevToken = file.getPrevToken(closingBracket);

            if (closingBracket.loc.start.line === prevToken.loc.end.line) {
                errors.add('Missing newline before closing curly brace', closingBracket.loc.start);
            }
        });
    }

};
