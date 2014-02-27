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

    getOptionName: function() {
        return 'requireMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType([ 'Program', 'FunctionDeclaration', 'FunctionExpression' ], function(node) {
            var firstVar = true;
            var firstParent = true;

            file.iterate(function(node) {
                var type = node && node.type;

                // Don't go in nested scopes
                if ( !firstParent && type && [ 'FunctionDeclaration', 'FunctionExpression' ].indexOf(type) > -1) {
                    return false;
                }

                if ( firstParent ) {
                    firstParent = false;
                }

                if (type === 'VariableDeclaration') {
                    if (!firstVar) {
                        errors.add(
                            'Var declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstVar = false;
                    }
                }
            }, node);
        });
    }

};
