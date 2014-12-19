var assert = require('assert');
var regenerate = require('regenerate');
var Lu = require('unicode-6.3.0/categories/Lu/code-points');
var Ll = require('unicode-6.3.0/categories/Ll/code-points');
var Lt = require('unicode-6.3.0/categories/Lt/code-points');
var Lm = require('unicode-6.3.0/categories/Lm/code-points');
var Lo = require('unicode-6.3.0/categories/Lo/code-points');

var letterPattern = regenerate(Lu, Ll, Lt, Lm, Lo).toRegExp();
var lowerCasePattern = regenerate(Ll).toRegExp();

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

            if (letterPattern.test(firstChar) && !lowerCasePattern.test(firstChar)) {
                errors.add(
                    'Comments must start with a lowercase letter',
                    comment.loc.start
                );
            }
        });
    }
};
