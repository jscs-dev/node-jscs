var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(
            typeof disallowMultipleVarDecl === 'boolean',
            'disallowMultipleVarDecl option requires boolean value'
        );
        this._disallowMultipleVarDecl = disallowMultipleVarDecl;
    },

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        if (!this._disallowMultipleVarDecl) {
            return;
        }
        file.iterateNodesByType('VariableDeclaration', function(node) {
            // allow multiple var declarations in for statement
            // for (var i = 0, j = myArray.length; i < j; i++) {}
            if (node.declarations.length > 1 && node.parentNode.type !== 'ForStatement') {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};
