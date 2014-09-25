var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(value) {
        var mode;
        var modes = {
            'all': true,
            'allButNested': true
        };
        var isObject = typeof value === 'object';

        var error = 'requireSpacesInsideParentheses rule' +
        ' requires string value \'all\' or \'allButNested\' or object';

        if (typeof value === 'string') {
            assert(modes[value], error);

        } else if (isObject) {
            assert(
                'all' in value || 'allButNested' in value,
                error
            );
        } else {
            assert(false, error);
        }

        this._exceptions = {};

        if (isObject) {
            mode = 'all' in value ? 'all' : 'allButNested';

            (value.except || []).forEach(function(value) {
                this._exceptions[value] = true;
            }, this);

        } else {
            mode = value;
        }

        if (mode === 'allButNested') {
            this._exceptions[')'] = this._exceptions['('] = true;
        }
    },

    getOptionName: function() {
        return 'requireSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var exceptions = this._exceptions;

        function isComment(position) {
            return file.getComments().some(function(comment) {
                return position >= comment.range[0] && position < comment.range[1];
            });
        }

        file.iterateTokenByValue('(', function(token, index, tokens) {
            var nextToken = file.getNextToken(token);
            var value = nextToken.value;
            var type = nextToken.type;

            if (value in exceptions) {
                return;
            }

            // Skip for empty parentheses
            if (value === ')') {
                return;
            }

            if (
                (token.range[1] === nextToken.range[0] &&
                    token.loc.end.line === nextToken.loc.start.line) ||
                    isComment(token.range[1])
            ) {
                errors.add('Missing space after opening round bracket', token.loc.end);
            }
        });

        file.iterateTokenByValue(')', function(token, index, tokens) {
            var prevToken = file.getPrevToken(token);
            var value = prevToken.value;
            var type = prevToken.type;

            if (value in exceptions) {

                // Special case - foo( object[i] )
                if (!(
                    value === ']' &&
                    file.getNodeByRange(token.range[0] - 1).type === 'MemberExpression'
                )) {
                    return;
                }
            }

            // Skip for empty parentheses
            if (value === '(') {
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
