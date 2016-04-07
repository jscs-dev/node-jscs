/**
 * Disallows tabs everywhere.
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * #### Example
 *
 * ```js
 * "disallowTabs": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * if (true) {
 * \s\sfoo();
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * if (true){
 * \tfoo();
 * }
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires a true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowTabs';
    },

    check: function(file, errors) {
        file.iterateTokensByType('Whitespace', function(whitespace) {
            var match = whitespace.value.match(/\t/);
            if (match) {
                errors.add('Tab found', whitespace, match.index);
            }
        });
    }
};
