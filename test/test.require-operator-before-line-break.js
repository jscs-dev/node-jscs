var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-operator-before-line-break', function() {
    var checker,
        operators = ['||', '&&', '*', '/', '%', '+', '-', '>=', '==', '===', '!=', '!==', '>', '<', '<='];

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        it('should report newline before ' + operator, function() {
            checker.configure({ requireOperatorBeforeLineBreak: [operator] });
            assert(checker.checkString('var x = y \n' + operator + ' String').getErrorCount() === 1);
        });

        it('should not report newline after ' + operator, function() {
            checker.configure({ requireOperatorBeforeLineBreak: [operator] });
            assert(checker.checkString('var x = y ' + operator + '\n String').isEmpty());
        });
    }, this);

    it('should report newline before ternary', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['?'] });
        assert(checker.checkString('var x = y \n? a : b').getErrorCount() === 1);
    });

    it('should not report newline after ternary', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['?'] });
        assert(checker.checkString('var x = y ?\n a : b').isEmpty());
    });
});
