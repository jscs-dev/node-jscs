var assert = require('assert');

function onedecl(file, errors) {
    file.iterateNodesByType('VariableDeclaration', function(node) {
        if (node.type === 'VariableDeclaration' &&
                node.declarations && (node.declarations.length > 1)) {
            errors.add(
                node.kind[0].toUpperCase() + node.kind.slice(1) +
                ' should be specified for each variable declaration (' +
                node.declarations.length + ')',
                node.loc.start
            );
        }
    });
}

function nonconsecutive(file, errors) {
    file.iterateNodesByType('VariableDeclaration', function(node) {
        var pos = node.parentCollection.indexOf(node);
        if (pos < node.parentCollection.length - 1) {
            var sibling = node.parentCollection[pos + 1];
            if (sibling.type === 'VariableDeclaration' && sibling.kind === node.kind) {
                errors.add(
                    node.kind[0].toUpperCase() + node.kind.slice(1) + ' declarations should be joined',
                    sibling.loc.start
                );
            }
        }
    });
}

function onevar(file, errors) {
    file.iterateNodesByType(['Program', 'FunctionDeclaration', 'FunctionExpression'], function(node) {
        var firstVar = true;
        var firstConst = true;
        var firstParent = true;

        file.iterate(function(node) {
            var type = node && node.type;
            var kind = node && node.kind;

            // Don't go in nested scopes
            if (!firstParent && type && ['FunctionDeclaration', 'FunctionExpression'].indexOf(type) > -1) {
                return false;
            }

            if (firstParent) {
                firstParent = false;
            }

            if (type === 'VariableDeclaration') {
                if (kind === 'var') {
                    if (!firstVar) {
                        errors.add(
                            'Var declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstVar = false;
                    }
                }

                if (kind === 'const') {
                    if (!firstConst) {
                        errors.add(
                            'Const declarations should be joined',
                            node.loc.start
                        );
                    } else {
                        firstConst = false;
                    }
                }
            }
        }, node);
    });
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireMultipleVarDecl) {
        var option = 'requireMultipleVarDecl option';
        assert(
            typeof requireMultipleVarDecl === 'string',
            option + ' requires string'
        );

        var requireMethod;
        switch (requireMultipleVarDecl) {
            case 'onedecl':
                requireMethod = onedecl;
                break;
            case 'nonconsecutive':
                requireMethod = nonconsecutive;
                break;
            case 'onevar':
                requireMethod = onevar;
                break;
            default:
                requireMethod = null;
                break;
        }
        assert(
            requireMethod !== null,
            option + ' requires value of `onevar`, `nonconsecutive` or `onedecl`'
        );

        this._check = requireMethod;
    },

    getOptionName: function() {
        return 'requireMultipleVarDecl';
    },

    check: function() {
        return this._check.apply(this, arguments);
    }
};
