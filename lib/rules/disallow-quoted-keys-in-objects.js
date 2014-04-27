var assert = require('assert');
var utils = require('../utils');

module.exports = function() {};

/**
 * @rule Disallow quoted keys in objects
 * @description
 * Disallows quoted keys in object if possible.
 *
 * Type: `String` or `Boolean`
 *
 * Values:
 *
 *  - `true` for strict mode
 *  - `"allButReserved"` allows ES3+ reserved words to remain quoted which is helpful when using this option with
 *    JSHint's `es3` flag.
 *
 * @example <caption>Example:</caption>
 * "disallowQuotedKeysInObjects": true
 * @example <caption>Valid for mode `true`:</caption>
 * var x = { a: { default: 1 } };
 * @example <caption>Valid for mode `"allButReserved"`:</caption>
 * var x = {a: 1, 'default': 2};
 * @example <caption>Invalid:</caption>
 * var x = {'a': 1};
 */
module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            disallowQuotedKeysInObjects === true || disallowQuotedKeysInObjects === 'allButReserved',
            this.getOptionName() + ' options should be "true" or an array of exceptions'
        );

        this._mode = disallowQuotedKeysInObjects;
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
                    if (mode === 'allButReserved' &&
                        (utils.isEs3Keyword(key.value) || utils.isEs3FutureReservedWord(key.value))
                    ) {
                        return;
                    }
                    errors.add('Extra quotes for key', prop.loc.start);
                }
            });
        });
    }

};
