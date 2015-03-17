/**
 * Requires newline before opening curly brace of all block statements.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireNewlineBeforeBlockStatements": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * function good()
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
 *
 * ##### Invalid
 *
 * ```js
 * function bad(){
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
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            options === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireNewlineBeforeBlockStatements';
    },

    check: function(file, errors) {
        file.iterateNodesByType('BlockStatement', function(node) {
            var openingBrace = file.getFirstNodeToken(node);
            var prevToken = file.getPrevToken(openingBrace);

            errors.assert.differentLine({
                token: prevToken,
                nextToken: openingBrace,
                message: 'Missing newline before curly brace for block statement'
            });
        });
    }
};
