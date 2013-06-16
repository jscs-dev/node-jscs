var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowMultipleVarDecl) {
        assert(typeof disallowMultipleVarDecl === 'boolean', 'disallow_multiple_var_decl option requires boolean value');
        assert(disallowMultipleVarDecl === true, 'disallow_multiple_var_decl option requires true value or should be removed');
    },

    getOptionName: function () {
        return 'disallow_multiple_var_decl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            if (node.declarations.length > 1) {
                errors.add('Multiple var declaration', node.loc.start.line, node.loc.start.column);
            }
        });
    }

};
