var assert = require('assert');
var tokenHelper = require('../token-helper');

var OPTION_NAME = 'disallowQuotedKeysInObjects';

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            disallowQuotedKeysInObjects === true || disallowQuotedKeysInObjects === 'allButReserved',
            OPTION_NAME + ' options should be "true" or an array of exceptions'
        );

        this._mode = disallowQuotedKeysInObjects;
    },

    getOptionName: function() {
        return OPTION_NAME;
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^(0|[1-9][0-9]*|[a-zA-Z_$]+[\w$]*)$/; // number or identifier
        var mode = this._mode;

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (mode === 'allButReserved' && tokenHelper.tokenIsReservedWord(key)) {
                    return;
                }
                if (key.type === 'Literal' &&
                    typeof key.value === 'string' &&
                    KEY_NAME_RE.test(key.value)
                ) {
                    errors.add('Extra quotes for key', prop.loc.start);
                }
            });
        });
    }

};
