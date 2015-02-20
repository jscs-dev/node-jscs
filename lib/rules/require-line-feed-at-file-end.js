/**
 * Requires placing line feed at file end.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireLineFeedAtFileEnd": true
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireLineFeedAtFileEnd) {
        assert(
            typeof requireLineFeedAtFileEnd === 'boolean',
            'requireLineFeedAtFileEnd option requires boolean value'
        );
        assert(
            requireLineFeedAtFileEnd === true,
            'requireLineFeedAtFileEnd option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireLineFeedAtFileEnd';
    },

    check: function(file, errors) {
        file.iterateTokensByType('EOF', function(eof) {
            var previousToken = file.getPrevToken(eof, {
                includeComments: true
            });

            errors.assert.linesBetween({
                token: previousToken,
                nextToken: eof,
                atLeast: 1,
                message: 'Missing line feed at file end'
            });
        });
    }
};
