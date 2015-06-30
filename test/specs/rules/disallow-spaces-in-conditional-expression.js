var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-conditional-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('afterTest', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { afterTest: true } });
        });

        it('should not report no space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a? b : c;')).to.have.no.errors();
        });

        it('should not report newline before question mark in Conditional Expression', function() {
            expect(checker.checkString('var x = a\n ? b : c;')).to.have.no.errors();
        });

        it('should report newline after question mark in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?\n b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report no space after test in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = (a)? b : c;')).to.have.no.errors();
        });

        it('should report space after test in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = (a) ? b : c;'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('beforeConsequent', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { beforeConsequent: true } });
        });

        it('should not report no space before consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?b : c;')).to.have.no.errors();
        });

        it('should report newline before question mark in Conditional Expression', function() {
            expect(checker.checkString('var x = a\n ? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report newline after question mark in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?\n b : c;')).to.have.no.errors();
        });

        it('should report space before consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space after test in Conditional Expression', function() {
            expect(checker.checkString('var x = a? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report no space before consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ?(b) : c;')).to.have.no.errors();
        });

        it('should report space after test for consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a? (b) : c;'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('afterConsequent', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { afterConsequent: true } });
        });

        it('should not report no space after consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b: c;')).to.have.no.errors();
        });

        it('should not report newline before colon in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b\n : c;')).to.have.no.errors();
        });

        it('should report newline after colon in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :\n c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space after consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space after consequent in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report no space after consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? (b): c;')).to.have.no.errors();
        });

        it('should report space after consequent in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? (b) : c;'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('beforeAlternate', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { beforeAlternate: true } });
        });

        it('should not report no space before alternate in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :c;')).to.have.no.errors();
        });

        it('should report newline before colon in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b\n : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report newline after colon in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :\n c;')).to.have.no.errors();
        });

        it('should report space before alternate in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space before alternate in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b: c;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report no space before alternate in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b :(c);')).to.have.no.errors();
        });

        it('should report space before alternate in parens in Conditional Expression', function() {
            expect(checker.checkString('var x = a ? b : (c);'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('true', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: true });
        });

        it('should not report no spaces in Conditional Expression', function() {
            expect(checker.checkString('var x = a?b:c;')).to.have.no.errors();
        });

        it('should report all spaces in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getValidationErrorCount() === 4);
        });

        it('should not report no spaces in recursive Conditional Expression', function() {
            expect(checker.checkString('var x = t1?c1t2?c2:a2:a1t3?c3:a3;')).to.have.no.errors();
        });

        it('should report all spaces in recursive Conditional Expression', function() {
            assert(checker.checkString('var x = t1 ? c1t2 ? c2 : a2 : a1t3 ? c3 : a3;').getValidationErrorCount() === 12);
        });
    });
});
