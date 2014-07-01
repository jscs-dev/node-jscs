var assert = require('assert');
var tokenHelper = require('../token-helper');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireTrailingComma) {
        assert(
            typeof requireTrailingComma === 'boolean',
            'requireTrailingComma option requires boolean value'
        );
        assert(
            requireTrailingComma === true,
            'requireTrailingComma option requires true value or should be removed'
        );
    },

    getOptionName: function() {
        return 'requireTrailingComma';
    },

    check: function(file, errors) {
        file.iterateNodesByType(['ObjectExpression', 'ArrayExpression'], function(node) {
            var isObject = node.type === 'ObjectExpression';
            var message = 'Missing comma before closing ' + (isObject ? ' curly brace' : ' bracket');
            var entities = isObject ? node.properties : node.elements;
            var last;
            var hasTrailingComma;

            if (entities.length) {
                last = entities[entities.length - 1];
                hasTrailingComma = tokenHelper.getTokenByRangeStartIfPunctuator(file, last.range[1], ',');

                if (!hasTrailingComma) {
                    errors.add(message, node.loc.end);
                }
            }
        });
    }

};
