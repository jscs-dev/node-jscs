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
