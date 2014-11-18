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
        var lastNode;
        file.iterate(function(node) {
            var lastDeclaration;
            var msg;

            if (node && node.type === 'VariableDeclaration') {
                if (node.kind === 'const') {
                    msg = 'Constant assignments should be followed by line break';
                } else {
                    msg = 'Variable assignments should be followed by line break';
                }
                for (var i = 0; i < node.declarations.length; i++) {
                    var thisDeclaration = node.declarations[i];
                    if (lastDeclaration && lastDeclaration.init &&
                        thisDeclaration.loc.start.line === lastDeclaration.loc.start.line) {
                        errors.add(msg, thisDeclaration.loc.start.line, thisDeclaration.loc.start.column);
                    }
                    lastDeclaration = thisDeclaration;
                }
                if (lastNode && node.loc.start.line === lastNode.loc.start.line) {
                    errors.add(msg, lastNode.loc.start.line, node.loc.start.column);
                }
                lastNode = node;
            }
        });
    }

};
