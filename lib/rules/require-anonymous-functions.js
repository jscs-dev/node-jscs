/**
 * Requires that a function expression be anonymous.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * #### Example
 *
 * ```js
 * "requireAnonymousFunctions": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var a = function(){
 *
 * };
 *
 * $('#foo').click(function(){
 *
 * })
 * ```
 *
 * ##### Invalid
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
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireAnonymousFunctions) {
        assert(
            requireAnonymousFunctions === true,
            'requireAnonymousFunctions option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireAnonymousFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionExpression', 'FunctionDeclaration'], function(node) {
            if (node.id !== null) {
                errors.add('Functions must not be named', node.loc.start);
            }
        });
    }
};
