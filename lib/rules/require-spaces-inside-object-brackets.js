var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'all_but_nested': true
        };
        assert(
            typeof mode === 'string' &&
            modes[mode],
            'require_spaces_inside_object_brackets option requires string value \'all\' or \'all_but_nested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'require_spaces_inside_object_brackets';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            var tokens = file.getTokens();
            var openingBracketPos = file.getTokenPosByRangeStart(node.range[0]);

            var openingBracket = tokens[openingBracketPos];
            var nextToken = tokens[openingBracketPos + 1];

            if (openingBracket.range[1] === nextToken.range[0]) {
                errors.add('Missing space after opening curly brace', nextToken.loc.start);
            }

            var closingBracketPos = file.getTokenPosByRangeStart(node.range[1] - 1);
            var closingBracket = tokens[closingBracketPos];
            var prevToken = tokens[closingBracketPos - 1];

            if (closingBracket.range[0] === prevToken.range[1]) {
                if (!(mode === 'all_but_nested' &&
                    prevToken.type === 'Punctuator' &&
                    prevToken.value === '}'
                )) {
                    errors.add('Missing space before closing curly brace', closingBracket.loc.start);
                }
            }
        });
    }

};
