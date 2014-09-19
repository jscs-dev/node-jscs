var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(
            disallowMultipleVarDecl === true || disallowMultipleVarDecl === 'strict',
            'disallowMultipleVarDecl option requires true or "strict" value'
        );

        this.strictMode = disallowMultipleVarDecl === 'strict';
    },

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        var inStrictMode = this.strictMode;

        file.iterateNodesByType('VariableDeclaration', function(node) {
            // allow multiple var declarations in for statement unless we're in strict mode
            // for (var i = 0, j = myArray.length; i < j; i++) {}
            if (node.declarations.length > 1 && (inStrictMode || node.parentNode.type !== 'ForStatement')) {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};
