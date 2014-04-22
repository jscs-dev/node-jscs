var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow multiple line strings
 * @description
 * Disallows strings that span multiple lines without using concatenation.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`multistr`](http://www.jshint.com/docs/options/#multistr)
 *
 * @example <caption>Example:</caption>
 * "disallowMultipleLineStrings": true
 * @example <caption>Valid:</caption>
 * var x = "multi" +
 *         "line";
 * var y = "single line";
 * @example <caption>Invalid:</caption>
 * var x = "multi \
 *         line";
 */
module.exports.prototype = {

    configure: function(disallowMultipleLineStrings) {
        assert(
            typeof disallowMultipleLineStrings === 'boolean',
            'disallowMultipleLineStrings option requires boolean value'
        );
        assert(
            disallowMultipleLineStrings === true,
            'disallowMultipleLineStrings option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowMultipleLineStrings';
    },

    check: function(file, errors) {
        file.iterateTokensByType('String', function(token) {
            if (token.loc.start.line !== token.loc.end.line) {
                errors.add(
                    'Multiline strings are disallowed.',
                    token.loc.start.line,
                    token.loc.start.column
                );
            }
        });
    }

};
