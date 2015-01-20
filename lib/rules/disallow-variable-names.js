/**
 * Disallows a specified set of variable names.
 *
 * Type: `Array`
 *
 * Values: Array of strings, which should be disallowed as variable names
 *
 * #### Example
 *
 * ```js
 * "disallowVariableNames": ['temp', 'foo']
 * ```
 *
 * ##### Valid
 *
 * ```js
 * var good = 1;
 * object[fine] = 2;
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var temp = 1;
 * object[foo] = 2;
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowVariableNames) {
        assert(
            Array.isArray(disallowVariableNames),
            'disallowVariableNames option requires an array'
        );

        this._disallowVariableNames = disallowVariableNames;
    },

    getOptionName: function() {
        return 'disallowVariableNames';
    },

    check: function(file, errors) {
        var disallowVariableNames = this._disallowVariableNames;
        file.iterateNodesByType('Identifier', function(node) {
            if (disallowVariableNames.indexOf(node.name) !== -1) {
                errors.add('Illegal variable name: ' + node.name, node.loc.start);
            }
        });
    }

};
