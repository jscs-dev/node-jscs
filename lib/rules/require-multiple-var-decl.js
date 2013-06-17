var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMultipleVarDecl) {
        assert(typeof requireMultipleVarDecl === 'boolean', 'require_multiple_var_decl option requires boolean value');
        assert(requireMultipleVarDecl === true, 'require_multiple_var_decl option requires true value or should be removed');
    },

    getOptionName: function () {
        return 'require_multiple_var_decl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            if (node.parentCollection) {
                for (var i = 0, l = node.parentCollection.length; i < l; i++) {
                    var sibling = node.parentCollection[i];
                    if (sibling === node && (i < l - 1)) {
                        sibling = node.parentCollection[i + 1];
                        if (sibling.type === 'VariableDeclaration') {
                            errors.add(
                                'Var declarations should be joined',
                                sibling.loc.start.line,
                                sibling.loc.start.column);
                        }
                        break;
                    }
                }
            }
        });
    }

};
