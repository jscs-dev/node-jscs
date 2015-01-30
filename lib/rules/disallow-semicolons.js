/**
 * Disallows lines from ending in a semicolon.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSemicolons": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = 1
 * ;[b].forEach(c)
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = 1;
 * [b].forEach(c);
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowSemicolons) {
        assert(
            disallowSemicolons === true,
            'disallowSemicolons option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSemicolons';
    },

    check: function(file, errors) {
        file.getTokens()
            .filter(function(token) {
                return token.type === 'Punctuator' && token.value === ';';
            })
            .forEach(function(token) {
                var nextToken = file.getNextToken(token);
                if (!nextToken || nextToken.loc.end.line > token.loc.end.line) {
                    errors.add('semicolons are disallowed at the end of a line.', token.loc.end);
                }
            });
    }
};
