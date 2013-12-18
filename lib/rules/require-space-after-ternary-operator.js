var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(optionValue) {
        assert(optionValue === true, this.getOptionName() + ' should be "true" or omitted at all');
    },

    getOptionName: function() {
        return 'requireSpaceAfterTernaryOperator';
    },

    check: function(file, errors) {

        var source = file.getSource();

        function getTokenLoc(index) {
            return file.getTokenLocByRangeStart(index, { xOffset: 1 });
        }

        file.iterateNodesByType(['ConditionalExpression'], function(node) {

            var qMarkIndex = source.indexOf('?', node.test.range[1]),
                colonIndex = source.indexOf(':', node.consequent.range[1]);

            if (source.charAt(qMarkIndex + 1) !== ' ') {
                errors.add('Token "?" should not stick to following expression', getTokenLoc(qMarkIndex));
            }
            if (source.charAt(colonIndex + 1) !== ' ') {
                errors.add('Token ":" should not stick to following expression', getTokenLoc(colonIndex));
            }
        });
    }
};
