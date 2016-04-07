/**
 * Disallows space before block statements (for loops, control structures).
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (cond){
 *     foo();
 * } else{
 *    bar();
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
 *
 * ##### Invalid
 *
 * ```js
 * if (cond) {
 *     foo();
 * } else {
 *    bar();
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
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            if (isBareBlock(node)) {
                return;
            }
            var first = node.getFirstToken();

            errors.assert.noWhitespaceBetween({
                token: file.getPrevToken(first),
                nextToken: first,
                disallowNewLine: true,
                message: 'Extra space before opening curly brace for block expressions'
            });
        });
    }
};

function isBareBlock(node) {
    var parentElement = node.parentElement;

    return parentElement &&
    parentElement.type === 'BlockStatement' ||
    parentElement.type === 'Program' ||
    parentElement.body && parentElement.body.type === 'BlockStatement' && Array.isArray(parentElement.body);
}
