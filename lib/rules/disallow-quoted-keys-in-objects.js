var assert = require('assert');

var OPTION_NAME = 'disallow_quoted_keys_in_objects';

module.exports = function() {};

module.exports.prototype = {

    configure: function(disallow) {
        assert(
            typeof disallow === 'boolean',
            OPTION_NAME + ' options requires boolean value'
        );
    },

    getOptionName: function() {
        return OPTION_NAME;
    },

    check: function(file, errors) {
        var KEY_NAME_RE = /^([0-9]+|[a-zA-Z_]+\w*)$/; // number or identifier
        file.iterateNodesByType('ObjectExpression', function(node) {
            node.properties.forEach(function(prop) {
                var key = prop.key;
                if (key.type === 'Literal' &&
                    typeof key.value === 'string' &&
                    KEY_NAME_RE.test(key.value)
                ) {
                    errors.add('Extra qoutes for key', prop.range[0]);
                }
            });
        });
    }

};
