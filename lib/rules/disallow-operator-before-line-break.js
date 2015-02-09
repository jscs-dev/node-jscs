/**
 * Requires putting certain operators on the next line rather than on the current line before a line break.
 *
 * Type: `Array` or `Boolean`
 *
 * Values: Array of operators to apply to or `true`
 *
 * #### Example
 *
 * ```js
 * "disallowOperatorBeforeLineBreak": ["+", "."]
 * ```
 *
 * ##### Valid
 *
 * ```js
 * $el.on( 'click', fn )
 * 	.appendTo( 'body' );
 *
 * var x = 4 + 5
 * 	+ 12 + 13;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * $el.on( 'click', fn ).
 * 	appendTo( 'body' );
 *
 * var x = 4 + 5 +
 * 	12 + 13;
 * ```
 */

var assert = require('assert');
var defaultOperators = require('../utils').binaryOperators.slice().concat(['.']);

module.exports = function() {};

module.exports.prototype = {
    configure: function(operators) {
        assert(Array.isArray(operators) || operators === true,
            'disallowOperatorBeforeLineBreak option requires array or true value');

        if (operators === true) {
            operators = defaultOperators;
        }
        this._operators = operators;
    },

    getOptionName: function() {
        return 'disallowOperatorBeforeLineBreak';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        var lastToken;
        var operators = this._operators;

        tokens.forEach(function(token) {
            if (lastToken) {
                if (lastToken.type === 'Punctuator' && operators.indexOf(lastToken.value) > -1) {
                    if (lastToken.loc.end.line < token.loc.end.line) {
                        errors.add(
                            'Operator needs to either be on the same line or after a line break.',
                           token.loc.start
                        );
                    }
                }
            }
            lastToken = token;
        });
    }
};
