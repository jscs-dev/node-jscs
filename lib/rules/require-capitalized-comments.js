var assert = require('assert');
var regenerate = require('regenerate');
var Lu = require('unicode-6.3.0/categories/Lu/code-points');
var Ll = require('unicode-6.3.0/categories/Ll/code-points');
var Lt = require('unicode-6.3.0/categories/Lt/code-points');
var Lm = require('unicode-6.3.0/categories/Lm/code-points');
var Lo = require('unicode-6.3.0/categories/Lo/code-points');

var letterPattern = regenerate(Lu, Ll, Lt, Lm, Lo).toRegExp();
var upperCasePattern = regenerate(Lu).toRegExp();

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
            var isLetter = firstChar && letterPattern.test(firstChar);

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
