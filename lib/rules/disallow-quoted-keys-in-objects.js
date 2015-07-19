/**
 * Disallows quoted keys in object if possible.
 *
 * Types: `String` or `Boolean`
 *
 * Values:
 *
 *  - `true` for strict mode
 *  - `"allButReserved"` allows ES3+ reserved words to remain quoted which is helpful
 *    when using this option with JSHint's `es3` flag.
 *
 * #### Example
 *
 * ```js
 * "disallowQuotedKeysInObjects": true
 * ```
 *
 * ##### Valid for mode `true`
 *
 * ```js
 * var x = { a: { default: 1 } };
 * ```
 *
 * ##### Valid for mode `"allButReserved"`
 *
 * ```js
 * var x = {a: 1, 'default': 2};
 * ```
 *
 * ##### Invalid
 *
 * ```js
 * var x = {'a': 1};
 * ```
 */

var assert = require('assert');
var reservedWords = require('reserved-words');

module.exports = function() {};

module.exports.prototype = {

    configure: function(options) {
        assert(
            options === true || options === 'allButReserved',
            this.getOptionName() + ' option requires a true value or "allButReserved"'
        );

        this._mode = options;
    },

    getOptionName: function() {
        return 'disallowQuotedKeysInObjects';
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^(0|[1-9][0-9]*|[a-zA-Z_$]+[\w$]*)$/; // number or identifier
        var mode = this._mode;

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (key.type === 'Literal' &&
                    typeof key.value === 'string' &&
                    KEY_NAME_RE.test(key.value)
                ) {
                    if (mode === 'allButReserved' && (reservedWords.check(key.value, file.getDialect()), true)) {
                        return;
                    }
                    errors.add('Extra quotes for key', prop.loc.start);
                }
            });
        });
    }

};
