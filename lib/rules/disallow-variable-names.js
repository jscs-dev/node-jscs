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

    configure: function(identifiers) {
        assert(
            Array.isArray(identifiers),
            'disallowVariableNames option requires an array'
        );

        this._identifierIndex = {};
        for (var i = 0, l = identifiers.length; i < l; i++) {
            this._identifierIndex[identifiers[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowVariableNames';
    },

    check: function(file, errors) {
        var disallowedIdentifiers = this._identifierIndex;

        file.iterateNodesByType('Identifier', function(node) {
            if (disallowedIdentifiers[node.name]) {
                errors.add('Illegal variable name: ' + node.name, node.loc.start);
            }
        });
    }

};
