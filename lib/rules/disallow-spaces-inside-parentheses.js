/**
 * Disallows space after opening round bracket and before closing.
 *
 * Type: `Object` or `Boolean`
 *
 * Values: `true` or Object with either `"only"` with array of tokens
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInsideParentheses": true
 * ```
 *
 * ##### Valid for `true` value
 *
 * ```js
 * var x = (1 + 2) * 3;
 * ```
 *
 * ##### Valid for `only` value
 *
 * ```js
 * "disallowSpacesInsideParentheses": { "only": [ "{", "}" ] }
 * ```
 *
 * ```js
 * var x = ( 1 + 2 );
 * var x = foo({});
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = foo( {} );
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(option) {
        var isObject = typeof option === 'object';

        var error = 'disallowSpacesInsideParentheses option requires' +
            ' true or object value with "only" properties ';

        // backcompat for 1.10: {all: true} #1027
        if (isObject && option.all === true) {
            option = true;
        }

        if (typeof option === 'boolean') {
            assert(option === true, error);
        } else if (isObject) {
            assert('only' in option, error);
        } else {
            assert(false, error);
        }

        if (option.only) {
            this._only = {};
            (option.only).forEach(function(value) {
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

        file.iterateTokenByValue('(', function(token) {
            var nextToken = file.getNextToken(token);
            var value = nextToken.value;

            if (only && !(value in only)) {
                return;
            }

            if (token.range[1] !== nextToken.range[0] &&
                    token.loc.end.line === nextToken.loc.start.line &&
                    !isCommentInRange(token.range[1], nextToken.range[0])) {
                errors.add('Illegal space after opening round bracket', token.loc.end);
            }
        });

        file.iterateTokenByValue(')', function(token) {
            var prevToken = file.getPrevToken(token);
            var value = prevToken.value;

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
