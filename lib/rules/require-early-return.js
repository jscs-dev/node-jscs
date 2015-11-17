var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === 'noElse',
            this.getOptionName() + ' option allow only the `noElse` value'
        );
    },

    getOptionName: function() {
        return 'requireEarlyReturn';
    },

    check: function(file, errors) {
        function addError(entity) {
            errors.add(
                'use of else after return',
                entity.loc.start.line,
                entity.loc.start.column
            );
        }

        file.iterateNodesByType('IfStatement', function(node) {
            if (!node.alternate) {
                return;
            }

            var ifBranch = node.consequent;
            if (ifBranch.type === 'ReturnStatement') {
                return addError(node.alternate);
            }

            if (ifBranch.type === 'BlockStatement') {
                if (ifBranch.body[ifBranch.body.length - 1].type === 'ReturnStatement') {
                    return addError(node.alternate);
                }
            }
        });
    }
};
