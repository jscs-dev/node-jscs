/**
 * Group your shorthand properties at the beginning of your object declaration.
 * Why? Because it's fancy! Oh, yeah.
 *
 * Types: `Boolean`
 *
 * Values: `true`
 *
 * Version: `ES6`
 *
 * #### Example
 *
 * ```js
 * "requireObjectShorthand": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var x = {
 *     a,
 *     handler,
 *     abc: xyz,
 *     test: test2
 * }
 * ```
 *
 * ##### Invalid
 *
 * ```js
  * var x = {
 *     a: a
 * }
 * ```
 *
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true,
            this.getOptionName() + ' option requires true value'
        );
    },

    getOptionName: function() {
        return 'requireObjectShorthand';
    },

    check: function(file, errors) {
        file.iterateNodesByType('Property', function(node) {
            if (node.key.name === node.value.name && !node.shorthand) {
                errors.add('You should use shorthand version', node.loc.start);
            }
        });
    }
};
