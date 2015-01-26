/**
 * Requires lines to not contain both spaces and tabs consecutively,
 * or spaces after tabs only for alignment if "smart"
 *
 * Type: `Boolean` or `String`
 *
 * Values: `true` or `"smart"`
 *
 * JSHint: [`smarttabs`](http://www.jshint.com/docs/options/#smarttabs)
 *
 * #### Example
 *
 * ```js
 * "disallowMixedSpacesAndTabs": true
 * ```
 *
 * ##### Valid example for mode `true`
 *
 * ```js
 * \tvar foo = "blah blah";
 * \s\s\s\svar foo = "blah blah";
 * \t/**
 * \t\s*
 * \t\s*\/ //a single space to align the star in a multi-line comment is allowed
 * ```
 *
 * ##### Invalid example for mode `true`
 *
 * ```js
 * \t\svar foo = "blah blah";
 * \s\tsvar foo = "blah blah";
 * ```
 *
 * ##### Valid example for mode `"smart"`
 *
 * ```js
 * \tvar foo = "blah blah";
 * \t\svar foo = "blah blah";
 * \s\s\s\svar foo = "blah blah";
 * \t/**
 * \t\s*
 * \t\s*\/ //a single space to align the star in a multi-line comment is allowed
 * ```
 *
 * ##### Invalid example for mode `"smart"`
 *
 * ```js
 * \s\tsvar foo = "blah blah";
 * ```
 */

var assert = require('assert');

module.exports = function() {};

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
        var test = this._disallowMixedSpacesAndTabs === true ?
            (/ \t|\t [^\*]|\t $/) :
            (/ \t/);

        file.getLinesWithCommentsRemoved().forEach(function(line, i) {
            if (line.match(test)) {
                errors.add('Mixed spaces and tabs found', i + 1, 0);
            }
        });
    }

};
