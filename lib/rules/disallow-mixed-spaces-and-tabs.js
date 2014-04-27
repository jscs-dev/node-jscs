var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow mixed spaces and tabs
 * @description
 * Requires lines to not contain both spaces and tabs consecutively,
 * or spaces after tabs only for alignment if "smart"
 *
 * Type: `Boolean` or `String`
 *
 * Values: `true` or `"smart"`
 *
 * JSHint: [smarttabs](http://www.jshint.com/docs/options/#smarttabs)
 * @example <caption>Example:</caption>
 * "disallowMixedSpacesAndTabs": true
 * @example <caption>Valid example for mode `true`:</caption>
 * \tvar foo = "blah blah";
 * \s\s\s\svar foo = "blah blah";
 * \t/&#42;&#42;
 * \t\s*
 * \t\s&#42;/ //a single space to align the star in a multi-line comment is allowed
 * @example <caption>Invalid example for mode `true`:</caption>
 * \t\svar foo = "blah blah";
 * \s\tsvar foo = "blah blah";
 * @example <caption>Valid example for mode `"smart"`:</caption>
 * \tvar foo = "blah blah";
 * \t\svar foo = "blah blah";
 * \s\s\s\svar foo = "blah blah";
 * \t/&#42;&#42;
 * \t\s*
 * \t\s&#42;/ //a single space to align the star in a multi-line comment is allowed
 * @example <caption>Invalid example for mode `"smart"`:</caption>
 * \s\tsvar foo = "blah blah";*/
module.exports.prototype = {

    configure: function(disallowMixedSpacesAndTabs) {
        assert(
            disallowMixedSpacesAndTabs === true || disallowMixedSpacesAndTabs === 'smart',
            'disallowMixedSpacesAndTabs option requires true or "smart" value'
        );

        this._disallowMixedSpacesAndTabs = disallowMixedSpacesAndTabs;
    },

    getOptionName: function() {
        return 'disallowMixedSpacesAndTabs';
    },

    check: function(file, errors) {
        var disallowMixedSpacesAndTabs = this._disallowMixedSpacesAndTabs;

        var lines = file.getLines().concat();

        var test = disallowMixedSpacesAndTabs === true ?
            (/ \t|\t [^\*]|\t $/) :
            (/ \t/);

        // remove comments from the code
        var comments = file.getComments();
        if (comments) {
            comments.forEach(function(comment) {
                var loc = comment.loc;
                var start = loc.start;
                var end = loc.end;
                var startIndex = start.line - 1;

                if (comment.type === 'Line') {
                    lines[startIndex] = lines[startIndex].substring(0, start.column);
                } else if (start.line !== end.line) {
                    for (var x = startIndex; x < end.line; x++) {
                        // remove all multine content to the right of the star
                        var starPos = lines[x].search(/ \*/);
                        if (starPos > -1) {
                            lines[x] = lines[x].substring(0, starPos + 2);
                        }
                    }
                }
            });
        }

        lines.forEach(function(line, i) {
            if (line.match(test)) {
                errors.add('Mixed spaces and tabs found', i + 1);
            }
        });
    }

};
