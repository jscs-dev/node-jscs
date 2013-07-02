var assert = require('assert');

module.exports = function() {};

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

    getOptionName: function () {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        file.iterateNodesByType('VariableDeclaration', function (node) {
            if (node.declarations.length > 1) {
                errors.add('Multiple var declaration', node.loc.start);
            }
        });
    }

};
