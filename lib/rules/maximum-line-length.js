/**
 * Requires all lines to be at most the number of characters specified
 *
 * Type: `Integer` or `Object`
 *
 * Values:
 *  - `Integer`: lines should be at most the number of characters specified
 *  - `Object`:
 *     - `value`: (required) lines should be at most the number of characters specified
 *     - `tabSize`: (default: `1`) considered the tab character as number of specified spaces
 *     - `allowComments`: (default: `false`) allows comments to break the rule
 *     - `allowUrlComments`: (default: `false`) allows comments with long urls to break the rule
 *     - `allowRegex`: (default: `false`) allows regular expression literals to break the rule
 *
 * JSHint: [`maxlen`](http://jshint.com/docs/options/#maxlen)
 *
 * #### Example
 *
 * ```js
 * "maximumLineLength": 40
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var aLineOf40Chars = 123456789012345678;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var aLineOf41Chars = 1234567890123456789;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(maximumLineLength) {
        this._tabSize = '';
        this._allowRegex = false;
        this._allowComments = false;
        this._allowUrlComments = false;

        if (typeof maximumLineLength === 'object') {
            assert(
                typeof maximumLineLength.value === 'number',
                'maximumLineLength option requires the "value" property to be defined'
            );

            this._maximumLineLength = maximumLineLength.value;
            var tabSize = maximumLineLength.tabSize || 0;

            while (tabSize--) {
                this._tabSize += ' ';
            }

            this._allowRegex = (maximumLineLength.allowRegex === true);
            this._allowComments = (maximumLineLength.allowComments === true);
            this._allowUrlComments = (maximumLineLength.allowUrlComments === true);
        } else {
            assert(
                typeof maximumLineLength === 'number',
                'maximumLineLength option requires number value or options object'
            );

            this._maximumLineLength = maximumLineLength;
        }
    },

    getOptionName: function() {
        return 'maximumLineLength';
    },

    check: function(file, errors) {
        var maximumLineLength = this._maximumLineLength;

        var line;
        var lines = this._allowComments ?
            file.getLinesWithCommentsRemoved() : file.getLines();

        // This check should not be destructive
        lines = lines.slice();

        if (this._allowRegex) {
            file.iterateTokensByType('RegularExpression', function(token) {
                for (var i = token.loc.start.line; i <= token.loc.end.line; i++) {
                    lines[i - 1] = '';
                }
            });
        }

        if (this._allowUrlComments) {
            file.getComments().forEach(function(comment) {
                for (var i = comment.loc.start.line; i <= comment.loc.end.line; i++) {
                    lines[i - 1] = lines[i - 1].replace(/(http|https|ftp):\/\/[^\s$]+/, '');
                }
            });
        }

        for (var i = 0, l = lines.length; i < l; i++) {
            line = this._tabSize ? lines[i].replace(/\t/g, this._tabSize) : lines[i];

            if (line.length > maximumLineLength) {
                errors.add(
                    'Line must be at most ' + maximumLineLength + ' characters',
                    i + 1,
                    lines[i].length
                );
            }
        }
    }

};
