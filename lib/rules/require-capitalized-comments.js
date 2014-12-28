var assert = require('assert');
var Lu = require('unicode-6.3.0/categories/Lu/regex');
var Ll = require('unicode-6.3.0/categories/Ll/regex');
var Lt = require('unicode-6.3.0/categories/Lt/regex');
var Lm = require('unicode-6.3.0/categories/Lm/regex');
var Lo = require('unicode-6.3.0/categories/Lo/regex');

function letterPattern(char) {
    return Lu.test(char) || Ll.test(char) || Lt.test(char) || Lm.test(char) || Lo.test(char);
}
function upperCasePattern(char) {
    return Lu.test(char);
}

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
            var isLetter = firstChar && letterPattern(firstChar);

            if (!isLetter) {
                inTextBlock = false;
                return;
            }

            var isUpperCase = upperCasePattern(firstChar);
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
