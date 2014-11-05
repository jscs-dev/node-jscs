var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
    configure: function(requireTrailingComma) {

        if (typeof requireTrailingComma === 'object') {
            if ('ignoreSingleValue' in requireTrailingComma) {
                assert(
                    requireTrailingComma.ignoreSingleValue === true,
                    'requireTrailingComma option ignoreSingleValue requires true value or should be removed'
                );
                this._ignoreSingleValue = true;
            }
            if ('ignoreSingleLine' in requireTrailingComma) {
                assert(
                    requireTrailingComma.ignoreSingleLine === true,
                    'requireTrailingComma option ignoreSingleLine requires true value or should be removed'
                );
                this._ignoreSingleLine = true;
            }
        } else {
            assert(
                requireTrailingComma === true,
                'requireTrailingComma option requires true value or should be removed'
            );
        }
    },

    getOptionName: function() {
        return 'requireTrailingComma';
    },

    check: function(file, errors) {
        var _this = this;

        file.iterateNodesByType(['ObjectExpression', 'ArrayExpression'], function(node) {
            var isObject = node.type === 'ObjectExpression';
            var entities = isObject ? node.properties : node.elements;

            if (entities.length === 0) {
                return;
            }

            if (_this._ignoreSingleValue && entities.length === 1) {
                return;
            }

            if (_this._ignoreSingleLine && node.loc.start.line === node.loc.end.line) {
                return;
            }

            var closingToken = file.getLastNodeToken(node);

            errors.assert.tokenBefore({
                token: closingToken,
                expectedTokenBefore: {type: 'Punctuator', value: ','},
                message: 'Missing comma before closing ' + (isObject ? ' curly brace' : ' bracket')
            });
        });
    }

};
