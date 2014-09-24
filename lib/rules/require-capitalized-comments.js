var assert = require('assert');

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
        var upperCasePattern = /[A-Z]/;
        var alphabeticalPattern = /[a-z|A-Z]/;

        file.getComments().forEach(function(comment) {
            var stripped = comment.value.replace(/[\n\s\*]/g, '');
            var firstChar = stripped[0];

            if (alphabeticalPattern.test(firstChar) && !upperCasePattern.test(firstChar)) {
                errors.add(
                    'Comments must start with an uppercase letter',
                    comment.loc.start
                );
            }
        });
    }
};
