/**
 * Requires space before block statements (for loops, control structures).
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireSpaceBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (cond) {
 *     foo();
 * } else {
 *     bar();
 * }
 *
 * for (var e in elements) {
 *     bar(e);
 * }
 *
 * while (cond) {
 *     foo();
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (cond){
 *     foo();
 * } else{
 *     bar();
 * }
 *
 * for (var e in elements){
 *     bar(e);
 * }
 *
 * while (cond){
 *     foo();
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireSpaceBeforeBlockStatements) {
        assert(
            typeof requireSpaceBeforeBlockStatements === 'boolean',
            'requireSpaceBeforeBlockStatements option requires boolean value'
        );
        assert(
            requireSpaceBeforeBlockStatements === true,
            'requireSpaceBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            var first = file.getFirstNodeToken(node);

            errors.assert.whitespaceBetween({
                token: file.getPrevToken(first),
                nextToken: first,
                spaces: 1,
                disallowNewLine: true,
                message: 'One space required before opening brace for block expressions'
            });
        });
    }

};
