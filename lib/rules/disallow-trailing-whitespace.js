/**
 * Requires all lines to end on a non-whitespace character
 *
 * Types: `Boolean` or `String`
 *
 * Values:
 *  - `true`
 *  - `"ignoreEmptyLines"`: (default: `false`) allow whitespace on empty lines
 *
 * JSHint: [`trailing`](http://jshint.com/docs/options/#trailing)
 *
 * #### Example
 *
 * ```js
 * "disallowTrailingWhitespace": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var foo = "blah blah";
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var foo = "blah blah"; //<-- whitespace character here
 * ```
 *
 * ##### Valid for `true`
 *
 * ```js
 * foo = 'bar';
 *
 * foo = 'baz';
 * ```
 *
 * ##### Invalid for `true` but Valid for `ignoreEmptyLines`
 *
 * ```js
 * foo = 'bar';
 * \t
 * foo = 'baz';
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true || options === 'ignoreEmptyLines',
            this.getOptionName() + ' option requires a true value or "ignoreEmptyLines"'
        );
        this._ignoreEmptyLines = options === 'ignoreEmptyLines';
    },

    getOptionName: function() {
        return 'disallowTrailingWhitespace';
    },

    check: function(file, errors) {
        errors.assert.noTrailingSpaces({
            ignoreEmptyLines: this._ignoreEmptyLines
        });
    }
};
