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
var _ = require('lodash');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSemicolons';
    },

    check: function(file, errors) {
        file.iterateTokensByTypeAndValue('Punctuator', ';', function(token) {
            var nextToken = file.getNextToken(token);
            // do not use assertions here as this is not yet autofixable
            if (nextToken.type === 'EOF' || nextToken.loc.end.line > token.loc.end.line) {
                errors.cast({
                    message: 'semicolons are disallowed at the end of a line.',
                    line: token.loc.end.line,
                    column: token.loc.end.column,
                    additional: token
                });
            }
        });
    },

    _fix: function(file, error) {
        var token = error.additional;

        _.remove(file.getTokens(), function(n) {
            return token === n;
        });
    }
};
