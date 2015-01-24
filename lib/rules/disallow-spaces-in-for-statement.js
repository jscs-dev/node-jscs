/**
 * Disallow spaces in between for statement.
 *
 * Type: `Boolean`
 *
 * Values: `true` to disallow spaces in between for statement.
 *
 * #### Example
 *
 * ```js
 * "disallowSpacesInForStatement": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * for(var i=0;i<l;i++) {
 *     x++;
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * for(var i = 0; i<l; i++) {
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
    configure: function(disallowSpacesInForStatement) {
        assert(
            disallowSpacesInForStatement === true,
            'disallowSpacesInForStatement option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpacesInForStatement';
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
                    spaces: 0,
                    message: 'Space found after semicolon'
                });
            }
            if (node.update) {
                var updateToken = file.getTokenByRangeStart(node.update.range[0]);
                prevToken = file.getPrevToken(updateToken);
                errors.assert.whitespaceBetween({
                    token: prevToken,
                    nextToken: updateToken,
                    spaces: 0,
                    message: 'Space found after semicolon'
                });
            }
        });
    }
};
