module.exports = function() {};

module.exports.prototype = {

    configure: function() {},

    getOptionName: function() {
        return 'disallowLeftStickedOperators';
    },

    check: function(file, errors) {
        errors.add(
            'The disallowLeftStickedOperators rule is no longer supported.' +
            '\nPlease use the following rules instead:' +
            '\n' +
            '\nrequireSpaceBeforeBinaryOperators' +
            '\nrequireSpaceBeforePostfixUnaryOperators' +
            '\nrequireSpacesInConditionalExpression',
            1,
            0
        );
    }

};
