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
        var lastToken = file.getLastToken();
        var prevToken = file.getPrevToken(lastToken, {includeComments: true});
        errors.assert.linesBetween({
            token: prevToken,
            nextToken: lastToken,
            atLeast: 1,
            message: 'Missing line feed at file end'
        });
    }

};
