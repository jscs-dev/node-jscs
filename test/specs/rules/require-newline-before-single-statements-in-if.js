var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-newline-before-single-statements-in-if', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requireNewlineBeforeSingleStatementsInIf: true });
        });

        it('should ignore if in a block statment', function() {
            expect(checker.checkString('if (x) {\n doX();\n} else {\n doY();\n}')).to.have.no.errors();
        });

        it('should not report missing newline before conditional statement', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse \ndoY();\n')).to.have.no.errors();
        });

        it('should not report missing newline before conditional for nested else if', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse if (v)\ndoV();\nelse\ndoY();'))
              .to.have.no.errors();
        });

        it('should report missing newline before conditional for consequent', function() {
            expect(checker.checkString('if (x) doX();\nelse\n doY();'))
              .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline before conditional for alternate', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse doY();'))
              .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });

        it('should report missing newline before conditional for nested else if', function() {
            expect(checker.checkString('if (x)\ndoX();\nelse if (v) doV();\nelse\ndoY();'))
              .to.have.one.validation.error.from('requireNewlineBeforeSingleStatementsInIf');
        });
    });
});
