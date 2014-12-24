var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireLineBreakAfterVariableAssignment) {
        assert(
            typeof requireLineBreakAfterVariableAssignment === 'boolean',
            'requireLineFeedAtFileEnd option requires boolean value'
        );
        assert(
            requireLineBreakAfterVariableAssignment === true,
            'requireLineFeedAtFileEnd option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireLineBreakAfterVariableAssignment';
    },

    check: function(file, errors) {
        var lastDeclaration;
        file.iterate(function(node) {

            if (node && node.type === 'VariableDeclaration') {
                for (var i = 0; i < node.declarations.length; i++) {
                    var thisDeclaration = node.declarations[i];
                    if (thisDeclaration.parentNode.kind === 'var') {
                        if (lastDeclaration && lastDeclaration.init &&
                            thisDeclaration.loc.start.line === lastDeclaration.loc.end.line) {
                            errors.add('Variable assignments should be followed by new line',
                                thisDeclaration.loc.start.line, thisDeclaration.loc.start.column);
                        }
                        lastDeclaration = thisDeclaration;
                    }
                }
            }
        });
    }

};
