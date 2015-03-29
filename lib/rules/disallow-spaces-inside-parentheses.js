/**
 * Disallows space after opening round bracket and before closing.
 *
 * Types: `Object` or `Boolean`
 *
 * Values: Either `true` or Object with `"only"` property as an array of tokens
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

        var error = this.getOptionName() + ' option requires' +
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

        file.iterateTokenByValue('(', function(token) {
            var nextToken = file.getNextToken(token, {includeComments: true});
            var value = nextToken.value;

            if (only && !(value in only)) {
                return;
            }

            errors.assert.noWhitespaceBetween({
                token: token,
                nextToken: nextToken,
                message: 'Illegal space after opening round bracket'
            });
        });

        file.iterateTokenByValue(')', function(token) {
            var prevToken = file.getPrevToken(token, {includeComments: true});
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

            errors.assert.noWhitespaceBetween({
                token: prevToken,
                nextToken: token,
                message: 'Illegal space before closing round bracket'
            });
        });
    }

};
