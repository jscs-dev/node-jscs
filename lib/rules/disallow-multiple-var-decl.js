module.exports = function() {};

module.exports.prototype = {
    configure: function() {},

    getOptionName: function() {
        return 'disallowMultipleVarDecl';
    },

    check: function(file, errors) {
        errors.add(this.getOptionName() + ' has been renamed to disallowMultipleVariableDeclarations');
    }
};
