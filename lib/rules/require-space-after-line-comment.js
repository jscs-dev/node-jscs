var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceAfterLineComment) {
        assert(
            requireSpaceAfterLineComment === true ||
            requireSpaceAfterLineComment === 'allowSlash',
            'requireSpaceAfterLineComment option requires the value true or `allowSlash`'
        );

        this._allowSlash = requireSpaceAfterLineComment === 'allowSlash';
    },

    getOptionName: function() {
        return 'requireSpaceAfterLineComment';
    },

    check: function(file, errors) {
        var comments = file.getComments();
        var allowSlash = this._allowSlash;

        comments.forEach(function(comment) {
            if (comment.type === 'Line') {
                var value = comment.value;

                // don't check triple slashed comments, microsoft js doc convention. see #593
                if (allowSlash && value[0] === '/') {
                    value = value.substr(1);
                }

                if (value.length === 0) {
                    return;
                }

                if (value[0] !== ' ') {
                    errors.add('Missing space after line comment', comment.loc.start);
                }
            }
        });
    }
};
