var assert = require('assert');

var upperCasePattern = /[A-Z]/;
var alphabeticalPattern = /[a-z|A-Z]/;

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireCapitalizedComments) {
        assert(
            requireCapitalizedComments === true,
            'requireCapitalizedComments option requires a value of true or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireCapitalizedComments';
    },

    check: function(file, errors) {
        var inTextBlock = null;

        file.getComments().forEach(function(comment) {
            var stripped = comment.value.replace(/[\n\s\*]/g, '');
            var firstChar = stripped[0];
            var isLetter = firstChar && alphabeticalPattern.test(firstChar);

            if (!isLetter) {
                inTextBlock = false;
                return;
            }

            var isUpperCase = upperCasePattern.test(firstChar);
            var isValid = isUpperCase || (inTextBlock && !isUpperCase);

            if (!isValid) {
                errors.add(
                    'Comments must start with an uppercase letter, unless it is part of a textblock',
                    comment.loc.start
                );
            }

            inTextBlock = !inTextBlock ? isLetter && isUpperCase : isLetter;
        });
    }
};
