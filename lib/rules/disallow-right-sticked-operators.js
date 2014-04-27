var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow right sticked operators
 * @description
 * Disallows sticking operators to the right.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "disallowRightStickedOperators": [
 *     "?",
 *     "+",
 *     "/",
 *     "*",
 *     ":",
 *     "=",
 *     "==",
 *     "===",
 *     "!=",
 *     "!==",
 *     ">",
 *     ">=",
 *     "<",
 *     "<="
 * ]
 * @example <caption>Valid:</caption>
 * x = y + 1;
 * @example <caption>Invalid:</caption>
 * x = y +1;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowRightStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowRightStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var nextToken = tokens[i + 1];
                if (nextToken && nextToken.range[0] === token.range[1]) {
                    errors.add(
                        'Operator ' + token.value + ' should not stick to following expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};
