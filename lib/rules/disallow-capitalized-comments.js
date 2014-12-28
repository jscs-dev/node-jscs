var assert = require('assert');
var Lu = require('unicode-6.3.0/categories/Lu/regex');
var Ll = require('unicode-6.3.0/categories/Ll/regex');
var Lt = require('unicode-6.3.0/categories/Lt/regex');
var Lm = require('unicode-6.3.0/categories/Lm/regex');
var Lo = require('unicode-6.3.0/categories/Lo/regex');

function letterPattern(char) {
    return Lu.test(char) || Ll.test(char) || Lt.test(char) || Lm.test(char) || Lo.test(char);
}
function lowerCasePattern(char) {
    return Ll.test(char);
}

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
        file.getComments().forEach(function(comment) {
            var stripped = comment.value.replace(/[\n\s\*]/g, '');
            var firstChar = stripped[0];

            if (letterPattern(firstChar) && !lowerCasePattern(firstChar)) {
                errors.add(
                    'Comments must start with a lowercase letter',
                    comment.loc.start
                );
            }
        });
    }
};
