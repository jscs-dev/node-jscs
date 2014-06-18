module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'requireRightStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The requireRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceAfterBinaryOperators' +
            '\ndisallowSpaceAfterPrefixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression',
            1,
            0
        );
    }

};
