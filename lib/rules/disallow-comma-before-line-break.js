/**
 * Disallows commas as last token on a line in lists.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`laxcomma`](http://www.jshint.com/docs/options/#laxcomma)
 *
 * #### Example
 *
 * ```js
 * "disallowCommaBeforeLineBreak": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = {
 *     one: 1
 *     , two: 2
 * };
 * var y = { three: 3, four: 4};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = {
 *     one: 1,
 *     two: 2
 * };
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowCommaBeforeLineBreak) {
        assert(
            typeof disallowCommaBeforeLineBreak === 'boolean',
            'disallowCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            disallowCommaBeforeLineBreak === true,
            'disallowCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token) {
            if (token.value === ',') {
                errors.assert.sameLine({
                    token: token,
                    nextToken: file.getNextToken(token),
                    message: 'Commas should be placed on new line'
                });
            }
        });
    }

};
