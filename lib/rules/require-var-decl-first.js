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

var error = 'Variable declarations must be the first statements of a function scope.';

function getParent(elem, name) {
    var parent = elem.parentElement;

    while(parent && !~parent.type.indexOf(name)) {
        parent = parent.parentElement;
    }

    return parent;
}

module.exports = function() {};

function check(file, errors, node) {
    var vars = file.getScopes().acquire(node);

    console.log(node.sourceCode);
    if (!vars) {
        return;
    }

    vars = vars.variables;

    // vars = vars.filter(function(v) {
    //     return v.kind === 'var';
    // });

    vars.forEach(function(v) {
        var def = v.definitions[0];

        // In case of implict globals, like
        // function() {x = 1}
        if (!def) {
            return;
        }

        var node = def.node;

        // VariableDeclarator -> VariableDeclaration
        var parent = node.parentElement.parentElement;

        var previous = parent.previousNonWhitespaceToken;

        // In case previous token doesn't exist
        // (very first var declaration)
        if (!previous) {
            return;
        }

        var previousParent = previous.parentElement;

        // previous element (not token!)
        // should some kind of function variation
        if (

            // Make sure we are not on "Program" level
            previousParent.parentElement &&
            // We need to get up one level since block is always a children of function
            // whereas the node we checking should be its children
            // Search for BlockStatement -> Function*
            ~previousParent.parentElement.type.indexOf('Function') &&

            // Check if its our function, for the case like
            // function a() {} var x = 1 // That should be an error
            previous.value === '{'
        ) {
            return;
        }


        // We should allow case like this -
        // function a() {
        //   "use strict"
        //   var x = 1
        // }
        if (
            previousParent.type === 'ExpressionStatement' &&
            previousParent.firstChild.value === 'use strict'
        ) {
            return;
        }

        errors.add(error, node);
    });
    }

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
        var scopesFoundInFile = {};
        var commentTokens = [];

        check = check.bind(this, file, errors);

        check(file.getProgram());

        file.iterateNodesByType([
            'FunctionDeclaration',
            'FunctionExpression'
        ], check);
    }
};
