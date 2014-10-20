var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(requireSpaceAfterLineComment) {
        assert(
            requireSpaceAfterLineComment === true ||
            requireSpaceAfterLineComment === 'allowSlash' ||
            typeof requireSpaceAfterLineComment === 'object',
            'requireSpaceAfterLineComment option requires the value `true` ' +
            'or an object with String[] `allExcept` property'
        );

        // verify first item in `allExcept` property in object (if it's an object)
        assert(
            typeof requireSpaceAfterLineComment !== 'object' ||
            Array.isArray(requireSpaceAfterLineComment.allExcept) &&
            typeof requireSpaceAfterLineComment.allExcept[0] === 'string',
            'Property `allExcept` in requireSpaceAfterLineComment should be an array of strings'
        );

        // don't check triple slashed comments, microsoft js doc convention. see #593
        // exceptions. see #592
        // need to drop allowSlash support in 2.0. Fixes #697
        this._allExcept = requireSpaceAfterLineComment === 'allowSlash' ? ['/'] :
            requireSpaceAfterLineComment.allExcept || [];
    },

    getOptionName: function() {
        return 'requireSpaceAfterLineComment';
    },

    check: function(file, errors) {
        var comments = file.getComments();
        var allExcept = this._allExcept;

        comments.forEach(function(comment) {
            if (comment.type === 'Line') {
                var value = comment.value;

                // cutout exceptions
                allExcept.forEach(function(el) {
                    if (value.indexOf(el) === 0) {
                        value = value.substr(el.length);
                    }
                });

                if (value.length === 0) {
                    return;
                }

                // tabs should be treated as spaces. see #592
                value = value.replace(/[\s]/g, ' ');

                if (value[0] !== ' ') {
                    errors.add('Missing space after line comment', comment.loc.start);
                }
            }
        });
    }
};
