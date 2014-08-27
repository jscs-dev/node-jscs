var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'allButNested': true
        };
        var isObject = typeof mode === 'object';

        var error = 'requireSpacesInsideParentheses option' +
        ' requires string value \'all\' or \'allButNested\' or object';

        if (typeof mode === 'string') {
            assert(modes[mode], error);

        } else if (isObject) {
            assert(
                'all' in mode || 'allButNested' in mode,
                error
            );
        } else {
            assert(false, error);
        }

        this._exceptions = {};

        if (isObject) {
            this._mode = 'all' in mode ? 'all' : 'allButNested';

            (mode.except || []).forEach(function(value) {
                this._exceptions[value] = true;
            }, this);

        } else {
            this._mode = mode;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var mode = this._mode;
        var exceptions = this._exceptions;

        function isComment(position) {
            return file.getComments().some(function(comment) {
                return position >= comment.range[0] && position < comment.range[1];
            });
        }

        file.iterateTokenByValue('(', function(token, index, tokens) {
            var nextToken = file.getNextToken(token),
                value = nextToken.value,
                type = nextToken.type;

            if (value in exceptions) {
                return;
            }

            // Skip the cases where we allow no space even if spaces are required.
            if (type === 'Punctuator' && value === ')') {
                return;
            }

            if (mode === 'allButNested' && type === 'Punctuator' && value === '(') {
                return;
            }

            if ((token.range[1] === nextToken.range[0] &&
                    token.loc.end.line === nextToken.loc.start.line) ||
                    isComment(token.range[1])) {
                errors.add('Missing space after opening round bracket', token.loc.end);
            }
        });

        file.iterateTokenByValue(')', function(token, index, tokens) {
            var prevToken = file.getPrevToken(token);
            var value = prevToken.value;
            var type = prevToken.type;

            if (value in exceptions) {
                return;
            }

            // Skip the cases where we allow no space even if spaces are required.
            if (type === 'Punctuator' && value === '(') {
                return;
            }

            if (mode === 'allButNested' && type === 'Punctuator' && value === ')') {
                return;
            }

            if (
                (token.range[0] === prevToken.range[1] &&
                    token.loc.end.line === prevToken.loc.start.line) ||
                    isComment(token.range[0] - 1)
            ) {
                errors.add('Missing space before closing round bracket',
                    token.loc.end.line,
                    token.loc.end.column - 2);
            }
        });
    }
};
