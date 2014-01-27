var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(mode) {
        if(mode === true) {
            // map old format to the new one
            mode = 'all';
        }
        assert(
            typeof mode === 'string',
            'requireMultipleVarDecl option requires string value'
        );
        assert(
            mode === 'all' || mode === 'skipWithEmptyLine',
            'requireMultipleVarDecl option requires string value \'all\' or \'skipWithEmptyLine\''
        );
        this._mode = mode;
    },

    getOptionName: function () {
        return 'requireMultipleVarDecl';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('VariableDeclaration', function (node) {
            var pos = node.parentCollection.indexOf(node);
            if (pos < node.parentCollection.length - 1) {
                var sibling = node.parentCollection[pos + 1];
                if (sibling.type === 'VariableDeclaration') {
                    if(mode === 'all' || sibling.loc.start.line <= node.loc.end.line + 1) {
                        errors.add(
                            'Var declarations should be joined',
                            sibling.loc.start
                        );
                    }
                }
            }
        });
    }

};
