module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'disallowRightStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The disallowRightStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceAfterBinaryOperators' +
            '\nrequireSpaceAfterPrefixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression',
            1,
            0
        );
    }

};
