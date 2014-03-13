var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require spaces inside array brackets
 * @description
 * Requires space after opening array square bracket and before closing.
 *
 * Type: `String`
 *
 * Values: "all" for strict mode, "allButNested" ignores closing brackets in a row.
 *
 * @example <caption>Example:</caption>
 * "requireSpacesInsideArrayBrackets": "all"
 * @example <caption>Valid for mode `"all"`:</caption>
 * var x = [ 1 ];
 * @example <caption>Valid for mode `"allButNested"`:</caption>
 * var x = [[ 1 ], [ 2 ]];
 * @example <caption>Invalid:</caption>
 * var x = [1];
 */
module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'allButNested': true
        };
        assert(
            typeof mode === 'string' &&
            modes[mode],
            'requireSpacesInsideArrayBrackets option requires string value \'all\' or \'allButNested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireSpacesInsideArrayBrackets';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ArrayExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (nextToken.type === 'Punctuator' && nextToken.value === ']') {
                return;
            }

            if (mode === 'allButNested' && nextToken.type === 'Punctuator' && nextToken.value === '[') {
                return;
            }

            if (openingBracket.range[1] === nextToken.range[0]) {
                errors.add('Missing space after opening square bracket', nextToken.loc.start);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.range[0] === prevToken.range[1]) {
                if (!(mode === 'allButNested' &&
                    prevToken.type === 'Punctuator' &&
                    prevToken.value === ']'
                )) {
                    errors.add('Missing space before closing square bracket', closingBracket.loc.start);
                }
            }
        });
    }

};
