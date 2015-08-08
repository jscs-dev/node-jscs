/**
 * Use computed property names when creating objects with dynamic property names
 *
 * Type: `Boolean`
 *
 * Value: `true`
 *
 * Version: `ES6`
 *
 * #### Example
 *
 * ```js
 * "requireComputedPropertyInObject": true
 * ```
 *
 * ##### Valid
 *
 * ```js
 * const obj = {
 *   id: 5,
 *   [getKey('enabled')]: true, // computed property
 * };
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * const obj = {
 *   id: 5
 * };
 * obj[getKey('enabled')] = true; // property created outside of object creation
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
        return 'requireComputedPropertyInObject';
    },

    check: function(file, errors) {
        file.iterateNodesByType('AssignmentExpression', function(node) {
            if (node.left.type === 'MemberExpression' && node.left.computed) {
                errors.add(
                    'Use computed property names when creating objects with dynamic property names',
                    node.loc.start
                );
            }
        });
    }

};
