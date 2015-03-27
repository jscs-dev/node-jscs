var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-not-operators-in-conditionals', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowNotOperatorsInConditionals: true });
    });

    describe('if statements', function() {
        it('should not report when not using the not operator in if statement with else', function() {
            assert(checker.checkString('if (a) {} else {}').isEmpty());
        });

        it('should report use of not operator in if statement with else', function() {
            assert(checker.checkString('if (!a) {} else {}').getErrorCount() === 1);
        });

        it('should not report use of not operator in if statement without an else statement', function() {
            assert(checker.checkString('if (!a) {}').isEmpty());
        });

        it('should not report use of not operator in if statement with an else if statement', function() {
            assert(checker.checkString('if (!a) {} else if (b) {} else {}').isEmpty());
        });

        it('should not report when not using the not equal operator in if statement with else', function() {
            assert(checker.checkString('if (a === b) {} else {}').isEmpty());
        });

        it('should report use of strict not equal operator in if statement with else', function() {
            assert(checker.checkString('if (a !== b) {} else {}').getErrorCount() === 1);
        });

        it('should not report use of strict not equal operator in if statement without an else statement', function() {
            assert(checker.checkString('if (a !== b) {}').isEmpty());
        });

        it('should not report use of strict not equal operator in if statement with an else if statement', function() {
            assert(checker.checkString('if (a !== b ) {} else if (b) {} else {}').isEmpty());
        });

        it('should report use of not equal operator in if statement with else', function() {
            assert(checker.checkString('if (a != b) {} else {}').getErrorCount() === 1);
        });

        it('should not report use of not equal operator in if statement without an else statement', function() {
            assert(checker.checkString('if (a != b) {}').isEmpty());
        });

        it('should not report use of not equal operator in if statement with an else if statement', function() {
            assert(checker.checkString('if (a != b ) {} else if (b) {} else {}').isEmpty());
        });
    });

    describe('conditional/ternary expressions', function() {
        it('should not report when not using the not operator in ternary expression', function() {
            assert(checker.checkString('var a = (clause) ? 1 : 0').isEmpty());
        });

        it('should report use of not operator in ternary expression', function() {
            assert(checker.checkString('var a = (!clause) ? 0 : 1').getErrorCount() === 1);
        });

        it('should report use of strict not equal operator in ternary expression', function() {
            assert(checker.checkString('var a = (clause !== true) ? 0 : 1').getErrorCount() === 1);
        });

        it('should report use of not equal operator in ternary expression', function() {
            assert(checker.checkString('var a = (clause != true) ? 0 : 1').getErrorCount() === 1);
        });
    });
});
