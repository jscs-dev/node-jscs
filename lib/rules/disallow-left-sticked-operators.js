var assert = require('assert');

module.exports = function() {};

/**
 * @rule Disallow left sticked operators
 * @description
 * Disallows sticking operators to the left.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * @example <caption>Example:</caption>
 * "disallowLeftStickedOperators": [
 *     "?",
 *     "+",
 *     "-",
 *     "/",
 *     "*",
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
 * x = y ? 1 : 2;
 * @example <caption>Invalid:</caption>
 * x = y? 1 : 2;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'disallowLeftStickedOperators option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'disallowLeftStickedOperators';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.range[1] === token.range[0]) {
                    errors.add(
                        'Operator ' + token.value + ' should not stick to preceding expression',
                        token.loc.start
                    );
                }
            }
        });
    }

};
