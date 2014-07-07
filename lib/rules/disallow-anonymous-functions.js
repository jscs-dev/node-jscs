var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowAnonymousFunctions) {
        assert(
            disallowAnonymousFunctions === true,
            'disallowAnonymousFunctions option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowAnonymousFunctions';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['FunctionExpression', 'FunctionDeclaration'], function(node) {
            if (node.id === null) {
                errors.add('Anonymous functions needs to be named', node.loc.start);
            }
        });
    }
};
