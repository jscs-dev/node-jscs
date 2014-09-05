var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceAfterLineComment) {
        assert(
            requireSpaceAfterLineComment === true,
            'requireSpaceAfterLineComment option requires the value true'
        );
    },

    getOptionName: function() {
        return 'requireSpaceAfterLineComment';
    },

    check: function(file, errors) {
        var comments = file.getComments();

        comments.forEach(function(comment) {
            if (comment.type === 'Line') {
                var value = comment.value;
                // don't check triple slashed comments, microsoft js doc convention. see #593
                if (value.length === 0 || value.substr(0, 3) === '/ <') {
                    return;
                }
                if (value[0] !== ' ') {
                    errors.add('Missing space after line comment', comment.loc.start);
                }
            }
        });
    }
};
