/**
 * Disallows space after object keys.
 *
 * Types: `Boolean` or `String`
 *
 * Values:
 *  - `true`
 *  - `"ignoreSingleLine"` ignores objects if the object only takes up a single line
 *  - `"ignoreMultiLine"` ignores objects if the object takes up multiple lines
 *  - `"ignoreAligned"` ignores aligned object properties
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
            'ignoreMultiLine': 'ignoreMultiLine',
            'ignoreAligned': 'ignoreAligned'
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
            var multiline = node.loc.start.line !== node.loc.end.line;
            if (mode === 'ignoreSingleLine' && !multiline) {
                return;
            }
            if (mode === 'ignoreMultiLine' && multiline) {
                return;
            }

            var maxKeyEndPos = 0;
            var tokens = [];
            node.properties.forEach(function(property) {
                if (property.shorthand || property.kind !== 'init') {
                    return;
                }

                var keyToken = file.getFirstNodeToken(property.key);
                if (mode === 'ignoreAligned') {
                    maxKeyEndPos = Math.max(maxKeyEndPos, keyToken.loc.end.column);
                }
                tokens.push(keyToken);
            });

            tokens.forEach(function(key) {
                var colon = file.getNextToken(key);
                var space = 0;
                if (mode === 'ignoreAligned') {
                    space = maxKeyEndPos - key.loc.end.column;
                }
                errors.assert.spacesBetween({
                    token: key,
                    nextToken: colon,
                    exactly: space,
                    message: 'Illegal space after key',
                    disallowNewLine: true
                });
            });
        });
    }

};
