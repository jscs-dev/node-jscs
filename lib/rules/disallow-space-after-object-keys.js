var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow space after object keys
 * @description
 * Disallows space after object keys.
 *
 * Type: `Boolean`
 *
 * Values: `true`
 *
 * @example <caption>Example:</caption>
 * "disallowSpaceAfterObjectKeys": true
 * @example <caption>Valid:</caption>
 * var x = {a: 1};
 * @example <caption>Invalid:</caption>
 * var x = {a : 1};
 */
module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            this.getOptionName() + ' option requires boolean value'
        );
        assert(
            disallow === true,
            this.getOptionName() + ' option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'disallowSpaceAfterObjectKeys';
    },

    check: function(file, errors) {
        var tokens = file.getTokens();
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(property) {
                var key = property.key;
                var keyPos = file.getTokenPosByRangeStart(key.range[0]);
                var colon = tokens[keyPos + 1];
                if (colon.range[0] !== key.range[1]) {
                    errors.add('Illegal space after key', key.loc.end);
                }
            });
        });
    }

};
