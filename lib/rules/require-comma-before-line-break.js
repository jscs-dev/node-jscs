var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require comma before line break
 * @description
 * Requires commas as last token on a line in lists.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [laxcomma](http://www.jshint.com/docs/options/#laxcomma)
 *
 * @example <caption>Example:</caption>
 * "requireCommaBeforeLineBreak": true
 * @example <caption>Valid:</caption>
 * var x = {
*     one: 1,
*     two: 2
* };
 * var y = { three: 3, four: 4};
 * @example <caption>Invalid:</caption>
 * var x = {
*     one: 1
*     , two: 2
* };
 */
module.exports.prototype = {

    configure: function(requireCommaBeforeLineBreak) {
        assert(
            typeof requireCommaBeforeLineBreak === 'boolean',
            'requireCommaBeforeLineBreak option requires boolean value'
        );
        assert(
            requireCommaBeforeLineBreak === true,
            'requireCommaBeforeLineBreak option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireCommaBeforeLineBreak';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Commas should not be placed on new line',
                        token.loc.start.line,
                        token.loc.start.column
                    );
                }
            }
        });
    }

};
