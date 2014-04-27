var assert = require('assert');

module.exports = function() {};

/**
 * @rule Require operator before line break
 * @description
 * Requires operators to appear before line breaks and not after.
 *
 * Type: `Array`
 *
 * Values: Array of quoted operators
 *
 * JSHint: [laxbreak](http://www.jshint.com/docs/options/#laxbreak)
 *
 * @example <caption>Example:</caption>
 * "requireOperatorBeforeLineBreak": [
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
 * x = y ?
 *     1 : 2;
 * @example <caption>Invalid:</caption>
 * x = y
 *     ? 1 : 2;
 */
module.exports.prototype = {

    configure: function(operators) {
        assert(Array.isArray(operators), 'requireOperatorBeforeLineBreak option requires array value');
        this._operatorIndex = {};
        for (var i = 0, l = operators.length; i < l; i++) {
            this._operatorIndex[operators[i]] = true;
        }
    },

    getOptionName: function() {
        return 'requireOperatorBeforeLineBreak';
    },

    check: function(file, errors) {
        var operators = this._operatorIndex;

        file.iterateTokensByType('Punctuator', function(token, i, tokens) {
            if (operators[token.value]) {
                var prevToken = tokens[i - 1];
                if (prevToken && prevToken.loc.end.line !== token.loc.start.line) {
                    errors.add(
                        'Operator ' + token.value + ' should not be on a new line',
                        token.loc.start
                    );
                }
            }
        });
    }

};
