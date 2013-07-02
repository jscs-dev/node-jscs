var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMultipleVarDecl) {
        assert(
            typeof requireMultipleVarDecl === 'boolean',
            'requireMultipleVarDecl option requires boolean value'
        );
        assert(
            requireMultipleVarDecl === true,
            'requireMultipleVarDecl option requires true value or should be removed'
        );
    },

    getOptionName: function () {
        return 'requireMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            var pos = node.parentCollection.indexOf(node);
            if (pos < node.parentCollection.length - 1) {
                var sibling = node.parentCollection[pos + 1];
                if (sibling.type === 'VariableDeclaration') {
                    errors.add(
                        'Var declarations should be joined',
                        sibling.loc.start
                    );
                }
            }
        });
    }

};
