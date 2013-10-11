var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(keyword) {
        assert(typeof keyword === 'string', 'safeContext option requires string value');

        this._keyword = keyword;
    },

    getOptionName: function () {
        return 'safeContextKeyword';
    },

    check: function(file, errors) {
        var keyword = this._keyword;

        // var that = this
        file.iterateNodesByType('VariableDeclaration', function (node) {

            for (var i = 0; i < node.declarations.length; i++) {
                var decl = node.declarations[i];

                if (decl.init.type === 'ThisExpression' && decl.id.name !== keyword) {
                    errors.add(
                        'You should use "' + keyword + '" to safe "this"',
                        node.loc.start
                    );
                }
            }
        });

        // that = this
        file.iterateNodesByType('AssignmentExpression', function (node) {

            if (node.right.type === 'ThisExpression' && node.left.name !== keyword) {
                errors.add(
                    'You should use "' + keyword + '" to safe "this"',
                    node.loc.start
                );
            }
        });
    }

};
