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
        file.getLines().forEach(function(line, i) {
            if (line.match(/\t/)) {
                errors.add('Tab found', i + 1, 0);
            }
        });
    }
};
