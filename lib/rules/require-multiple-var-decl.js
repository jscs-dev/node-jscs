/**
 * Requires multiple `var` declaration.
 *
 * Types: `Boolean` or `String`
 *
 * Values: `true` or `"onevar"`
 *
 * if `requireMultipleVarDecl` defined as a `true` value, it will report only consecutive vars, if, on the other hand,
 * value equals to `"onevar"` string, `requireMultipleVarDecl` will allow only one `var` per function scope.
 *
 * JSHint: [`onevar`](http://jshint.com/docs/options/#onevar)
 *
 * #### Example
 *
 * ```js
 * "requireMultipleVarDecl": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = 1,
 *     y = 2;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = 1;
 * var y = 2;
 * ```
 */

var assert = require('assert');

function consecutive(file, errors) {
    file.iterateNodesByType('VariableDeclaration', function(node) {
        var pos = node.parentCollection.indexOf(node);
        if (pos < node.parentCollection.length - 1) {
            var sibling = node.parentCollection[pos + 1];
            if (sibling.type === 'VariableDeclaration' && sibling.kind === node.kind) {
                errors.add(
                    node.kind[0].toUpperCase() + node.kind.slice(1) + ' declarations should be joined',
                    sibling.loc.start
                );
            }
        }
    });
}

function onevar(file, errors) {
    file.iterateNodesByType(['Program', 'FunctionDeclaration', 'FunctionExpression'], function(node) {
        var firstVar = true;
        var firstConst = true;
        var firstParent = true;

        file.iterate(function(node) {
            var type = node.type;
            var kind = node.kind;

            // Don't go in nested scopes
            if (!firstParent && ['FunctionDeclaration', 'FunctionExpression'].indexOf(type) > -1) {
                return false;
            }

            if (firstParent) {
                firstParent = false;
            }

            if (type === 'VariableDeclaration') {
                if (kind === 'var') {
                    if (!firstVar) {
                        errors.add(
                            'Var declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstVar = false;
                    }
                }

                if (kind === 'const') {
                    if (!firstConst) {
                        errors.add(
                            'Const declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstConst = false;
                    }
                }
            }
        }, node);
    });
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true || options === 'onevar',
            this.getOptionName() + ' option requires a true value or `onevar`'
        );

        this._check = typeof options === 'string' ? onevar : consecutive;
    },

    getOptionName: function() {
        return 'requireMultipleVarDecl';
    },

    check: function() {
        return this._check.apply(this, arguments);
    }
};
