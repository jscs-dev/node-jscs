/**
 * Disallows multiple `var` declaration (except for-loop).
 *
 * Type: `Boolean` or `String`
 *
 * Values:
 *
 * - `true` disallows multiple variable declarations except within a for loop
 * - `'strict'` disallows all multiple variable declarations
 * - `'exceptUndefined'` allows declarations where all variables are not defined
 *
 * #### Example
 *
 * ```js
 * "disallowMultipleVarDecl": true
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * var x = 1;
 * var y = 2;
 *
 * for (var i = 0, j = arr.length; i < j; i++) {}
 * ```
 *
 * ##### Valid for `strict`
 *
 * ```js
 * var x = 1;
 * var y = 2;
 * ```
 *
 * ##### Valid for `exceptUndefined`
 *
 * ```js
 * var a, b;
 * var x = 1;
 * var y = 2;
 *
 * for (var i = 0, j = arr.length; i < j; i++) {}
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = 1,
 *     y = 2;
 *
 * var x, y = 2, z;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(
            disallowMultipleVarDecl === true ||
            disallowMultipleVarDecl === 'strict' ||
            disallowMultipleVarDecl === 'exceptUndefined',
            'disallowMultipleVarDecl option requires true, "strict", or "exceptUndefined" value'
        );

        this.strictMode = disallowMultipleVarDecl === 'strict';
        this.exceptUndefined = disallowMultipleVarDecl === 'exceptUndefined';
    },

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        var inStrictMode = this.strictMode;
        var exceptUndefined = this.exceptUndefined;

        file.iterateNodesByType('VariableDeclaration', function(node) {
            var hasDefinedVariables = node.declarations.some(function(declaration) {
                return !!declaration.init;
            });

            var isForStatement = node.parentNode.type === 'ForStatement';

            // allow single var declarations
            if (node.declarations.length === 1 ||
                // allow multiple var declarations in for statement unless we're in strict mode
                // for (var i = 0, j = myArray.length; i < j; i++) {}
                !inStrictMode && isForStatement ||
                // allow multiple var declarations with all undefined variables in exceptUndefined mode
                // var a, b, c
                exceptUndefined && !hasDefinedVariables) {
                return;
            }

            errors.add('Multiple var declaration', node.loc.start);
        });
    }

};
