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
        // file.iterateTokensByType('EOF', function(eof) {
        //     console.log(eof);

        //     var previousToken = file.getPrevToken(eof, {
        //         includeWhitespace: true
        //     });

        //     errors.assert.linesBetween({
        //         token: previousToken,
        //         nextToken: eof,
        //         atLeast: 0,
        //         message: 'Missing line feed at file end'
        //     });
        // });
        var lines = file.getLines();
        if (lines[lines.length - 1] !== '') {
            errors.add('Missing line feed at file end', lines.length, 0);
        }
    }

};
