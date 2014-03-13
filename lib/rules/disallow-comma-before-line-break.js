var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow Comma Before Line Break
 * @description
 * Disallows commas as last token on a line in lists.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [laxcomma](http://www.jshint.com/docs/options/#laxcomma)
 * @example <caption>Usage</caption>
 * "disallowCommaBeforeLineBreak": true
 * @example <caption>Valid:</caption>
 * var x = {
 *     one: 1
 *     , two: 2
 * };
 * var y = { three: 3, four: 4};
 * @example <caption>Invalid:</caption>
 * var x = {
 *     one: 1,
 *    two: 2
 * };
 *
 * */
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
        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (token.value === ',') {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.loc.start.line !== token.loc.end.line) {
                    errors.add(
                        'Commas should be placed on new line',
                        token.loc.end.line,
                        token.loc.end.column
                    );
                }
            }
        });
    }

};
