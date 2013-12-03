var assert = require('assert');

var OPTION_NAME = 'disallowQuotedKeysInObjects';

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            disallowQuotedKeysInObjects === true || disallowQuotedKeysInObjects === 'allButReserved',
            OPTION_NAME + ' options should be "true" or an array of exceptions'
        );

        this._mode = disallowQuotedKeysInObjects;

        this._keywords = {
            'arguments': true,
            'break': true,
            'case': true,
            'catch': true,
            'class': true,
            'continue': true,
            'debugger': true,
            'default': true,
            'delete': true,
            'do': true,
            'else': true,
            'enum': true,
            'eval': true,
            'export': true,
            'extends': true,
            'finally': true,
            'for': true,
            'function': true,
            'if': true,
            'implements': true,
            'import': true,
            'in': true,
            'instanceof': true,
            'interface': true,
            'let': true,
            'new': true,
            'package': true,
            'private': true,
            'protected': true,
            'public': true,
            'return': true,
            'static': true,
            'super': true,
            'switch': true,
            'this': true,
            'throw': true,
            'try': true,
            'typeof': true,
            'var': true,
            'void': true,
            'while': true,
            'with': true,
            'yield': true
        };
    },

    getOptionName: function() {
        return OPTION_NAME;
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^(0|[1-9][0-9]*|[a-zA-Z_$]+[\w$]*)$/; // number or identifier
        var keywords = this._keywords;
        var mode = this._mode;

        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (mode === 'allButReserved' && keywords[key.value]) {
                    return;
                }
                if (key.type === 'Literal' &&
                    typeof key.value === 'string' &&
                    KEY_NAME_RE.test(key.value)
                ) {
                    errors.add('Extra qoutes for key', prop.loc.start);
                }
            });
        });
    }

};
