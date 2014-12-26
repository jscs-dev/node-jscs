var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-in-conditional-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('afterTest', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { afterTest: true } });
        });

        it('should not report no space after test in Conditional Expression', function() {
            assert(checker.checkString('var x = a? b : c;').isEmpty());
        });

        it('should not report newline before question mark in Conditional Expression', function() {
            assert(checker.checkString('var x = a\n ? b : c;').isEmpty());
        });

        it('should report newline after question mark in Conditional Expression', function() {
            assert(checker.checkString('var x = a ?\n b : c;').getErrorCount() === 1);
        });

        it('should report space after test in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getErrorCount() === 1);
        });

        it('should report space after test in Conditional Expression', function() {
            assert(checker.checkString('var x = a ?b : c;').getErrorCount() === 1);
        });

        it('should not report no space after test in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = (a)? b : c;').isEmpty());
        });

        it('should report space after test in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = (a) ? b : c;').getErrorCount() === 1);
        });
    });

    describe('beforeConsequent', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { beforeConsequent: true } });
        });

        it('should not report no space before consequent in Conditional Expression', function() {
            assert(checker.checkString('var x = a ?b : c;').isEmpty());
        });

        it('should report newline before question mark in Conditional Expression', function() {
            assert(checker.checkString('var x = a\n ? b : c;').getErrorCount() === 1);
        });

        it('should not report newline after question mark in Conditional Expression', function() {
            assert(checker.checkString('var x = a ?\n b : c;').isEmpty());
        });

        it('should report space before consequent in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getErrorCount() === 1);
        });

        it('should report space after test in Conditional Expression', function() {
            assert(checker.checkString('var x = a? b : c;').getErrorCount() === 1);
        });

        it('should not report no space before consequent in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a ?(b) : c;').isEmpty());
        });

        it('should report space after test for consequent in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a? (b) : c;').getErrorCount() === 1);
        });
    });

    describe('afterConsequent', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { afterConsequent: true } });
        });

        it('should not report no space after consequent in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b: c;').isEmpty());
        });

        it('should not report newline before colon in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b\n : c;').isEmpty());
        });

        it('should report newline after colon in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b :\n c;').getErrorCount() === 1);
        });

        it('should report space after consequent in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getErrorCount() === 1);
        });

        it('should report space after consequent in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b :c;').getErrorCount() === 1);
        });

        it('should not report no space after consequent in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? (b): c;').isEmpty());
        });

        it('should report space after consequent in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? (b) : c;').getErrorCount() === 1);
        });
    });

    describe('beforeAlternate', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: { beforeAlternate: true } });
        });

        it('should not report no space before alternate in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b :c;').isEmpty());
        });

        it('should report newline before colon in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b\n : c;').getErrorCount() === 1);
        });

        it('should not report newline after colon in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b :\n c;').isEmpty());
        });

        it('should report space before alternate in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getErrorCount() === 1);
        });

        it('should report space before alternate in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b: c;').getErrorCount() === 1);
        });

        it('should not report no space before alternate in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b :(c);').isEmpty());
        });

        it('should report space before alternate in parens in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : (c);').getErrorCount() === 1);
        });
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInConditionalExpression: true });
        });

        it('should not report no spaces in Conditional Expression', function() {
            assert(checker.checkString('var x = a?b:c;').isEmpty());
        });

        it('should report all spaces in Conditional Expression', function() {
            assert(checker.checkString('var x = a ? b : c;').getErrorCount() === 4);
        });

        it('should not report no spaces in recursive Conditional Expression', function() {
            assert(checker.checkString('var x = t1?c1t2?c2:a2:a1t3?c3:a3;').isEmpty());
        });

        it('should report all spaces in recursive Conditional Expression', function() {
            assert(checker.checkString('var x = t1 ? c1t2 ? c2 : a2 : a1t3 ? c3 : a3;').getErrorCount() === 12);
        });
    });
});
