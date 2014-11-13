var assert = require('assert');

var upperCasePattern = /[A-Z]/;
var alphabeticalPattern = /[a-z|A-Z]/;

function strictUppercase(file, errors) {
    file.getComments().forEach(function(comment) {
        var stripped = comment.value.replace(/[\n\s\*]/g, '');
        var firstChar = stripped[0];

        if (firstChar && alphabeticalPattern.test(firstChar) && !upperCasePattern.test(firstChar)) {
            errors.add(
                'Comments must start with an uppercase letter',
                comment.loc.start
            );
        }
    });
}

function textblockUppercase(file, errors) {
    var inTextBlock = null;

    file.getComments().forEach(function(comment, i) {
        var stripped = comment.value.replace(/[\n\s\*]/g, '');
        var firstChar = stripped[0];
        var isLetter = firstChar && alphabeticalPattern.test(firstChar);

        if (!isLetter) {
            inTextBlock = false;
            return;
        }

        var isUpperCase = upperCasePattern.test(firstChar);
        var isValid = (!inTextBlock && isUpperCase) || (inTextBlock && !isUpperCase);

        if (!isValid) {
            errors.add(
                'Comments starting a new textblock must start with an uppercase letter',
                comment.loc.start
            );
        }

        inTextBlock = !inTextBlock ? isLetter && isUpperCase : isLetter;
    });
}

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireCapitalizedComments) {
        assert(
            typeof requireCapitalizedComments === 'boolean' ||
            typeof requireCapitalizedComments === 'string',
            'requireCapitalizedComments option requires boolean or string'
        );

        assert(
            requireCapitalizedComments === true || requireCapitalizedComments === 'textblock',
            'requireCapitalizedComments option requires a true value, `textblock` string'
        );

        this._check = requireCapitalizedComments === 'textblock' ? textblockUppercase : strictUppercase;
    },

    getOptionName: function() {
        return 'requireCapitalizedComments';
    },

    check: function(file, errors) {
        this._check.apply(this, arguments);
    }
};
