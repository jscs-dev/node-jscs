var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'allButNested': true
        };
        assert(
            typeof mode === 'string' &&
            modes[mode],
            'requireSpacesInsideParentheses option requires string value \'all\' or \'allButNested\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var mode = this._mode;

        function isComment(position) {
            return file.getComments().some(function(comment) {
                return position >= comment.range[0] && position < comment.range[1];
            });
        }

        // Iterate punctuators since '(', ')' can exist in multiple contexts.
        file.iterateTokensByType('Punctuator', function(token, index, tokens) {
            if (token.value === '(') {
                var nextToken = tokens[index + 1];

                // Skip the cases where we allow no space even if spaces are required.
                if (nextToken.type === 'Punctuator' && nextToken.value === ')') {
                    return;
                }

                if (mode === 'allButNested' && nextToken.type === 'Punctuator' &&
                    nextToken.value === '(') {
                    return;
                }

                if ((token.range[1] === nextToken.range[0] &&
                        token.loc.end.line === nextToken.loc.start.line) ||
                        isComment(token.range[1])) {
                    errors.add('Missing space after opening round bracket', token.loc.end);
                }
            }

            if (token.value === ')') {
                var prevToken = tokens[index - 1];

                // Skip the cases where we allow no space even if spaces are required.
                if (prevToken.type === 'Punctuator' && prevToken.value === '(') {
                    return;
                }

                if (mode === 'allButNested' && prevToken.type === 'Punctuator' &&
                    prevToken.value === ')') {
                    return;
                }

                if ((token.range[0] === prevToken.range[1] &&
                        token.loc.end.line === prevToken.loc.start.line) ||
                        isComment(token.range[0] - 1)) {
                    errors.add('Missing space before closing round bracket',
                        token.loc.end.line,
                        token.loc.end.column - 2);
                }
            }
        });
    }
};
