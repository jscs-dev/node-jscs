var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-spaces-in-conditional-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('afterTest', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInConditionalExpression: { afterTest: true } });
        });

        it('should report no space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a? b : c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;')).to.have.no.errors();
        });

        it('should report no space after test in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = (a)? b : c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space after test in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = (a) ? b : c;')).to.have.no.errors();
        });
    });

    describe('beforeConsequent', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInConditionalExpression: { beforeConsequent: true } });
        });

        it('should report no space before consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?b : c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space before consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;')).to.have.no.errors();
        });

        it('should report no space before consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?(b) : c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space before consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? (b) : c;')).to.have.no.errors();
        });
    });

    describe('afterConsequent', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInConditionalExpression: { afterConsequent: true } });
        });

        it('should report no space after consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b: c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space after consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;')).to.have.no.errors();
        });

        it('should report no space after consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? (b): c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space after consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? (b) : c;')).to.have.no.errors();
        });
    });

    describe('beforeAlternate', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInConditionalExpression: { beforeAlternate: true } });
        });

        it('should report no space before alternate in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :c;'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space before alternate in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;')).to.have.no.errors();
        });

        it('should report no space before alternate in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :(c);'))
              .to.have.one.validation.error.from('requireSpacesInConditionalExpression');
        });

        it('should not report space before alternate in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : (c);')).to.have.no.errors();
        });
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInConditionalExpression: true });
        });

        it('should report no spaces in Conditional Expression', function() {
            expect(checker.checkString('var x = a?b:c;')).to.have.error.count.equal(4);
        });

        it('should not report all spaces in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;')).to.have.no.errors();
        });

        it('should report no spaces in Conditional Expression', function() {
            expect(checker.checkString('var x = (a)?(b):(c);')).to.have.error.count.equal(4);
        });

        it('should not report all spaces in Conditional Expression', function() {
            expect(checker.checkString('var x = (a) ? (b) : (c);')).to.have.no.errors();
        });

        it('should report no spaces in recursive Conditional Expression', function() {
            expect(checker.checkString('var x = t1?c1t2?c2:a2:a1t3?c3:a3;')).to.have.error.count.equal(12);
        });

        it('should not report all spaces in recursive Conditional Expression', function() {
            expect(checker.checkString('var x = t1 ? c1t2 ? c2 : a2 : a1t3 ? c3 : a3;')).to.have.no.errors();
        });
    });
});
