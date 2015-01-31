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
            if (node.test) {
                var testToken = file.getFirstNodeToken(node.test);
                errors.assert.whitespaceBetween({
                    token: file.getPrevToken(testToken),
                    nextToken: testToken,
                    spaces: 1,
                    message: 'One space required after semicolon'
                });
            }
            if (node.update) {
                var updateToken = file.getFirstNodeToken(node.update);
                errors.assert.whitespaceBetween({
                    token: file.getPrevToken(updateToken),
                    nextToken: updateToken,
                    spaces: 1,
                    message: 'One space required after semicolon'
                });
            }
        });
    }
};
