var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(option) {
        var isObject = typeof option === 'object';

        var error = 'disallowSpacesInsideParentheses option requires' +
            ' true or object value with "all" or "only" properties ';

        if (typeof option === 'boolean') {
            assert(option === true, error);

        } else if (isObject) {
            assert(!('all' in option && 'only' in option), error);
            assert('all' in option || 'only' in option, error);

        } else {
            assert(false, error);
        }

        if (option.only) {
            this._only = {};
            (option.only || []).forEach(function(value) {
                this._only[value] = true;
            }, this);
        } else {
            this._only = null;
        }
    },

    getOptionName: function() {
        return 'disallowSpacesInsideParentheses';
    },

    check: function(file, errors) {
        var only = this._only;

        function isCommentInRange(start, end) {
            return file.getComments().some(function(comment) {
                return start <= comment.range[0] && end >= comment.range[1];
            });
        }

        file.iterateTokenByValue('(', function(token, index, tokens) {
            var nextToken = file.getNextToken(token);
            var value = nextToken.value;
            var type = nextToken.type;

            if (only && !(value in only)) {
                return;
            }

            if (token.range[1] !== nextToken.range[0] &&
                    token.loc.end.line === nextToken.loc.start.line &&
                    !isCommentInRange(token.range[1], nextToken.range[0])) {
                errors.add('Illegal space after opening round bracket', token.loc.end);
            }
        });

        file.iterateTokenByValue(')', function(token, index, tokens) {
            var prevToken = file.getPrevToken(token);
            var value = prevToken.value;
            var type = prevToken.type;

            if (only) {
                if (!(value in only)) {
                    return;
                }

                if (
                    value === ']' &&
                    file.getNodeByRange(prevToken.range[0]).type === 'MemberExpression'
                ) {
                    return;
                }
            }

            if (prevToken.range[1] !== token.range[0] &&
                    prevToken.loc.end.line === token.loc.start.line &&
                    !isCommentInRange(prevToken.range[1], token.range[0])) {
                errors.add('Illegal space before closing round bracket', prevToken.loc.end);
            }
        });
    }

};
