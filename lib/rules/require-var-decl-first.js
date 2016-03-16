/**
 * Requires `var` declaration to be on the top of an enclosing scope
 *
 * Types: `Boolean`
 *
 * Values:
 *
 * - `true` specifies that `var` declarations must occur the top of a function scope.
 *
 * #### Example
 *
 * ```js
 * "requireVarDeclFirst": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var x = 1,
 *     y = 2;
 * ```
 * ```js
 * 'use strict;'
 * var x = 1,
 *     y = 2;
 * ```
 * ```js
 * var x = 1;
 * var y = 2;
 * ```
 * ```js
 * var x = 1;
 * // comments
 * var y = 2;
 * ```
 * ```js
 * var x = 1;
 * // comments
 * // comments 2
 * var y = 2;
 * ```
 * ```js
 * const a = 1;
 * const b = 2;
 * ```
 * ```js
 * var x = 1;
 * function y() {var z;};
 * ```
 * ```js
 * var x = 1;
 * var y = function () {var z;};
 * ```
 * ```js
 * var w = 1;
 * function x() {
 *  var y;
 * // comments
 * // comments 2
 *  var z;
 * };
 * ```
 * ```js
 * var w = 1;
 * function x() {
 *  "use strict";
 *  var y;
 * };
 * ```
 * ```js
 * var x = 1;
 * var y;
 * for (y = 0; y < 10; y++) {};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x;
 * x = 1;
 * var y = 2;
 * ```
 * ```js
 * var w = 1;
 * function x() {var y;};
 * var z = 2;
 * ```
 * ```js
 * var w = 1;
 * function x() {
 *  var y;
 *  y = 2;
 *  var z;
 * };
 * ```
 * ```js
 * var a;
 * for(var count=0;count < 10;count++){}
 * ```
 * ```js
 * var x;
 * for(var count=0;count < 10;count++){
 *  var y;
 * }
 * ```
 *
 */

var assert = require('assert');

function isScopeElement(elem) {
    return elem.type === 'Program' ||
        elem.type === 'BlockStatement' && (
            elem.parentElement.type === 'FunctionExpression' ||
            elem.parentElement.type === 'FunctionDeclaration' ||
            elem.parentElement.type === 'ArrowFunctionExpression'
        );
}

function isVarDeclFirst(varDecl) {
    var elem = varDecl.previousSibling;
    while (elem && (elem.isComment || elem.isWhitespace ||
        elem.type === 'VariableDeclaration' ||
        elem.type === 'Punctuator' ||
        elem.type === 'ExpressionStatement' && elem.expression.value === 'use strict')) {
        elem = elem.previousSibling;
    }

    if (elem === null) {
        return true;
    }

    return false;
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value'
        );
    },

    getOptionName: function() {
        return 'requireVarDeclFirst';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['VariableDeclaration'], function(varDecl) {
            // Ignore let and const for now #1783
            if (varDecl.kind !== 'var') {
                return;
            }

            // Checking scope to not allow vars inside block statements.
            if (isScopeElement(varDecl.parentElement) && isVarDeclFirst(varDecl)) {
                return;
            }

            errors.add('Variable declarations must be the first statements of a function scope.',
                varDecl);
        });
    }
};
