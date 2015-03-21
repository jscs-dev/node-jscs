/**
 * Requires that a function expression be named.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowAnonymousFunctions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = function foo(){
 *
 * };
 *
 * $('#foo').click(function bar(){
 *
 * });
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var a = function(){
 *
 * };
 *
 * $('#foo').click(function(){
 *
 * });
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
        return 'disallowAnonymousFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionExpression', 'FunctionDeclaration'], function(node) {
            if (node.id === null) {
                errors.add('Anonymous functions need to be named', node.loc.start);
            }
        });
    }
};
