var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow multiple var decl
 * @description
 * Disallows multiple `var` declaration (except for-loop).
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * JSHint: [`onevar`](http://jshint.com/docs/options/#onevar)
 *
 * @example <caption>Example:</caption>
 * "disallowMultipleVarDecl": true
 * @example <caption>Valid:</caption>
 * var x = 1;
 * var y = 2;
 * for (var i = 0, j = arr.length; i < j; i++) {}
 * @example <caption>Invalid:</caption>
 * var x = 1,
 *     y = 2;
 */
module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(
            typeof disallowMultipleVarDecl === 'boolean',
            'disallowMultipleVarDecl option requires boolean value'
        );
        assert(
            disallowMultipleVarDecl === true,
            'disallowMultipleVarDecl option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function(node) {
            // allow multiple var declarations in for statement
            // for (var i = 0, j = myArray.length; i < j; i++) {}
            if (node.declarations.length > 1 && node.parentNode.type !== 'ForStatement') {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};
