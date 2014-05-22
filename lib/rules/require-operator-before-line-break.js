var assert = require('assert');
var defaultOperators = require('../utils').binaryOperators.slice();

defaultOperators.push('?');

module.exports = function() {};

module.exports.prototype = {

    configure: function(operators) {
        var isTrue = operators === true;

        assert(
            Array.isArray(operators) || isTrue,
            'requireOperatorBeforeLineBreak option requires array value or true value'
        );

        if ( isTrue ) {
            operators = defaultOperators;
        }

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
