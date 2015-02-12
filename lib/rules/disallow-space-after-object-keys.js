/**
 * Disallows space after object keys.
 *
 * Type: `Boolean`
 *
 * Values:
 *  - `true`
 *  - `"ignoreSingleLine"` ignores objects if the object only takes up a single line
 *  - `"ignoreMultiLine"` ignores objects if the object takes up multiple lines
 *
 * #### Example
 *
 * ```js
 * "disallowSpaceAfterObjectKeys": true
 * ```
 *
 * ##### Valid
 * ```js
 * var x = {a: 1};
 * ```
 * ##### Invalid
 * ```js
 * var x = {a : 1};
 * ```
 */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        var modes = {
            'ignoreSingleLine': 'ignoreSingleLine',
            'ignoreMultiLine': 'ignoreMultiLine'
        };
        assert(
            disallow === true || typeof disallow === 'string' && modes[disallow],
            this.getOptionName() +
            ' option requires true value requires one of the following values: ' +
            Object.keys(modes).join(', ')
        );
        this._mode = disallow === true ? true : modes[disallow];
    },

    getOptionName: function() {
        return 'disallowSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                if (property.shorthand || property.method || property.kind !== 'init') {
                    return;
                }
                if (mode === 'ignoreSingleLine' && node.loc.start.line === node.loc.end.line) {
                    return;
                }
                if (mode === 'ignoreMultiLine' && node.loc.start.line !== node.loc.end.line) {
                    return;
                }

                var token = file.getFirstNodeToken(property.key);
                errors.assert.noWhitespaceBetween({
                    token: token,
                    nextToken: file.getNextToken(token),
                    message: 'Illegal space after key',
                    disallowNewLine: true
                });
            });
        });
    }

};
