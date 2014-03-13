var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require aligned object values
 * @description
 * Requires proper alignment in object literals.
 *
 * Type: `String`
 *
 * Values:
 * - `"all"` for strict mode,
 * - `"skipWithFunction"` ignores objects if one of the property values is a function expression,
 * - `"skipWithLineBreak"` ignores objects if there are line breaks between properties
 *
 * @example <caption>Example:</caption>
 * "requireAlignedObjectValues": "all"
 * @example <caption>Valid:</caption>
 * var x = {
 *     a   : 1,
 *     bcd : 2,
 *     ef  : 'str'
 * };
 * @example <caption>Invalid:</caption>
 * var x = {
 *     a : 1,
 *     bcd : 2,
 *     ef : 'str'
 * };
 */
module.exports.prototype = {

    configure: function(mode) {
        var modes = {
            'all': true,
            'skipWithFunction': true,
            'skipWithLineBreak': true
        };
        assert(
            typeof mode === 'string' && modes[mode],
            this.getOptionName() + ' option requires string value \'skipWithFunction\' or \'skipWithLineBreak\''
        );
        this._mode = mode;
    },

    getOptionName: function() {
        return 'requireAlignedObjectValues';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        var mode = this._mode;
        file.iterateNodesByType('ObjectExpression', function(node) {
            if (node.loc.start.line === node.loc.end.line || node.properties < 2) {
                return;
            }

            var skip = false;
            var maxKeyEndPos = 0;

            node.properties.forEach(function(property, index) {
                var keyEndPos = property.key.loc.end.column;
                if (keyEndPos > maxKeyEndPos) {
                    maxKeyEndPos = keyEndPos;
                }
                skip = skip || (mode === 'skipWithFunction' && property.value.type === 'FunctionExpression') ||
                    (mode === 'skipWithLineBreak' && index > 0 &&
                     node.properties[index - 1].loc.end.line !== property.loc.start.line - 1);
            });

            if (skip) {
                return;
            }

            node.properties.forEach(function(property) {
                var keyPos = file.getTokenPosByRangeStart(property.key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.loc.start.column !== maxKeyEndPos + 1) {
                    errors.add('Alignment required', colon.loc.start);
                }
            });
        });
    }

};
