var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow spaces inside array brackets
 * @description
 * Disallows space after opening array square bracket and before closing.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * @example <caption>Example:</caption>
 * "disallowSpacesInsideArrayBrackets": true
 * @example <caption>Valid:</caption>
 * var x = [1];
 * @example <caption>Invalid:</caption>
 * var x = [ 1 ];
 */
module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ArrayExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.loc.start.line === nextToken.loc.start.line &&
                openingBracket.range[1] !== nextToken.range[0]
            ) {
                errors.add('Illegal space after opening square brace', openingBracket.loc.end);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.loc.start.line === prevToken.loc.start.line &&
                closingBracket.range[0] !== prevToken.range[1]
            ) {
                errors.add('Illegal space before closing square brace', prevToken.loc.end);
            }
        });
    }

};
