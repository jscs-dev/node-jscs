var assert = require('assert');

var OPTION_NAME = 'disallowQuotedKeysInObjects';

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallowQuotedKeysInObjects) {
        assert(
            typeof disallowQuotedKeysInObjects === 'boolean',
            OPTION_NAME + ' options requires boolean value'
        );
        assert(
            disallowQuotedKeysInObjects === true,
            'disallowQuotedKeysInObjects option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return OPTION_NAME;
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^([1-9][0-9]+|[a-zA-Z_$]+[\w$]*)$/; // number or identifier
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
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
