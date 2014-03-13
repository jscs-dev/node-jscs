var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require right sticked operators
 * @description
 * Requires sticking operators to the right.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "requireRightStickedOperators": ["!"]
 * @example <caption>Valid:</caption>
 * x = !y;
 * @example <caption>Invalid:</caption>
 * x = ! y;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireRightStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireRightStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] !== token.range[1]) {
                    errors.add(
                        'Operator ' + token.value + ' should stick to following expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};
