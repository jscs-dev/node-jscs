var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireFunctionDeclarations) {
        assert(
            requireFunctionDeclarations === true,
            'requireFunctionDeclarations option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireFunctionDeclarations';
    },

    check: function(file, errors) {
        file.iterateNodesByType(
            'VariableDeclarator',
            function(node) {
                if (node.init && node.init.type === 'FunctionExpression') {
                    errors.add('Use a function declaration instead', node.loc.start);
                }
            }
        );

        file.iterateNodesByType(
            'AssignmentExpression',
            function(node) {
                if (node.left.type !== 'MemberExpression' &&
                    node.right.type === 'FunctionExpression') {
                    errors.add('Use a function declaration instead', node.loc.start);
                }
            }
        );
    }
};
