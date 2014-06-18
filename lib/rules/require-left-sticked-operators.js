module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'requireLeftStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The requireLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\ndisallowSpaceBeforeBinaryOperators' +
            '\ndisallowSpaceBeforePostfixUnaryOperators' +
            '\ndisallowSpacesInConditionalExpression',
            1,
            0
        );
    }

};
