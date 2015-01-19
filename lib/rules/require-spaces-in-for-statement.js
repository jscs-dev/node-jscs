/**
 * Requires spaces inbetween for statement.
 *
 * Type: `Boolean`
 *
 * Values: `true` to requires spaces inbetween for statement.
 *
 * #### Example
 *
 * ```js
 * "requireSpacesInForStatement": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * for(var i = 0; i<l; i++) {
 *     x++;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * for(var i = 0;i<l;i++) {
 *     x++;
 * }
 * ```
 *
 * ```js
 * for(var i = 0; i<l;i++) {
 *     x++;
 * }
 * ```
 *
 * ```js
 * for(var i = 0;i<l; i++) {
 *     x++;
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpacesInForStatement) {
        assert(
            requireSpacesInForStatement === true,
            'requireSpacesInForStatement option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpacesInForStatement';
    },

    check: function(file, errors) {
        file.iterateNodesByType('ForStatement', function(node) {
            var prevToken;
            if (node.test) {
                var testToken = file.getTokenByRangeStart(node.test.range[0]);
                prevToken = file.getPrevToken(testToken);
                errors.assert.whitespaceBetween({
                    token: prevToken,
                    nextToken: testToken,
                    spaces: 1,
                    message: 'Missing space after semicolon'
                });
            }
            if (node.update) {
                var updateToken = file.getTokenByRangeStart(node.update.range[0]);
                prevToken = file.getPrevToken(updateToken);
                errors.assert.whitespaceBetween({
                    token: prevToken,
                    nextToken: updateToken,
                    spaces: 1,
                    message: 'Missing space after semicolon'
                });
            }
        });
    }
};
