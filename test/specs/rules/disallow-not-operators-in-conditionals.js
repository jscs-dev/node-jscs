var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-not-operators-in-conditionals', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowNotOperatorsInConditionals: true });
    });

    describe('if statements', function() {
        it('should not report when not using the not operator in if statement with else', function() {
            expect(checker.checkString('if (a) {} else {}')).to.have.no.errors();
        });

        it('should report use of not operator in if statement with else', function() {
            expect(checker.checkString('if (!a) {} else {}'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });

        it('should not report use of not operator in if statement without an else statement', function() {
            expect(checker.checkString('if (!a) {}')).to.have.no.errors();
        });

        it('should not report use of not operator in if statement with an else if statement', function() {
            expect(checker.checkString('if (!a) {} else if (b) {} else {}')).to.have.no.errors();
        });

        it('should not report when not using the not equal operator in if statement with else', function() {
            expect(checker.checkString('if (a === b) {} else {}')).to.have.no.errors();
        });

        it('should report use of strict not equal operator in if statement with else', function() {
            expect(checker.checkString('if (a !== b) {} else {}'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });

        it('should not report use of strict not equal operator in if statement without an else statement', function() {
            expect(checker.checkString('if (a !== b) {}')).to.have.no.errors();
        });

        it('should not report use of strict not equal operator in if statement with an else if statement', function() {
            expect(checker.checkString('if (a !== b ) {} else if (b) {} else {}')).to.have.no.errors();
        });

        it('should report use of not equal operator in if statement with else', function() {
            expect(checker.checkString('if (a != b) {} else {}'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });

        it('should not report use of not equal operator in if statement without an else statement', function() {
            expect(checker.checkString('if (a != b) {}')).to.have.no.errors();
        });

        it('should not report use of not equal operator in if statement with an else if statement', function() {
            expect(checker.checkString('if (a != b ) {} else if (b) {} else {}')).to.have.no.errors();
        });
    });

    describe('conditional/ternary expressions', function() {
        it('should not report when not using the not operator in ternary expression', function() {
            expect(checker.checkString('var a = (clause) ? 1 : 0')).to.have.no.errors();
        });

        it('should report use of not operator in ternary expression', function() {
            expect(checker.checkString('var a = (!clause) ? 0 : 1'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });

        it('should report use of strict not equal operator in ternary expression', function() {
            expect(checker.checkString('var a = (clause !== true) ? 0 : 1'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });

        it('should report use of not equal operator in ternary expression', function() {
            expect(checker.checkString('var a = (clause != true) ? 0 : 1'))
              .to.have.one.validation.error.from('disallowNotOperatorsInConditionals');
        });
    });
});
