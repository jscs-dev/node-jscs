var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(disallowCapitalizedComments) {
        assert(
            disallowCapitalizedComments === true,
            'disallowCapitalizedComments option requires a value of true or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowCapitalizedComments';
    },

    check: function(file, errors) {
        var lowerCasePattern = /[a-z]/;
        var alphabeticalPattern = /[a-z|A-Z]/;

        file.getComments().forEach(function(comment) {
            var stripped = comment.value.replace(/[\n\s\*]/g, '');
            var firstChar = stripped[0];

            if (alphabeticalPattern.test(firstChar) && !lowerCasePattern.test(firstChar)) {
                errors.add(
                    'Comments must start with a lowercase letter',
                    comment.loc.start
                );
            }
        });
    }
};
