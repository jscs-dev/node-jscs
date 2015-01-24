/**
 * Disallows newline before opening curly brace of all block statements.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowNewlineBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function good(){
 *     var obj = {
 *         val: true
 *     };
 *
 *     return {
 *         data: obj
 *     };
 * }
 *
 * if (cond){
 *     foo();
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
 * function bad()
 * {
 *     var obj =
 *     {
 *         val: true
 *     };
 *
 *     return {
 *         data: obj
 *     };
 * }
 *
 * if (cond)
 * {
 *     foo();
 * }
 *
 * for (var e in elements)
 * {
 *     bar(e);
 * }
 *
 * while (cond)
 * {
 *     foo();
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowNewlineBeforeBlockStatements) {
        assert(
            typeof disallowNewlineBeforeBlockStatements === 'boolean',
            'disallowNewlineBeforeBlockStatements option requires boolean value'
        );
        assert(
            disallowNewlineBeforeBlockStatements === true,
            'disallowNewlineBeforeBlockStatements option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowNewlineBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            var openingBrace = file.getFirstNodeToken(node);
            var prevToken = file.getPrevToken(openingBrace);

            errors.assert.sameLine({
                token: prevToken,
                nextToken: openingBrace,
                message: 'Newline before curly brace for block statement is disallowed'
            });
        });
    }
};
