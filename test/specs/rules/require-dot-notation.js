var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-dot-notation', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value `true`', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: true });
        });

        // by default
        it('should not report literal subscription for es6 reserved words', function() {
            expect(checker.checkString('var x = a[\'yield\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'let\']')).to.have.no.errors();
        });

        it('should report literal subscription', function() {
            expect(checker.checkString('var x = a[\'b\']')).to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'π\']')).to.have.one.validation.error.from('requireDotNotation');
        });

        it('should not report literal subscription for reserved words', function() {
            expect(checker.checkString('var x = a[null]')).to.have.no.errors();
            expect(checker.checkString('var x = a[true]')).to.have.no.errors();
            expect(checker.checkString('var x = a[false]')).to.have.no.errors();
        });

        it('should not report number subscription', function() {
            expect(checker.checkString('var x = a[1]')).to.have.no.errors();
        });

        it('should not report variable subscription', function() {
            expect(checker.checkString('var x = a[c]')).to.have.no.errors();
            expect(checker.checkString('var x = a[π]')).to.have.no.errors();
        });

        it('should not report object property subscription', function() {
            expect(checker.checkString('var x = a[b.c]')).to.have.no.errors();
        });

        it('should not report dot notation', function() {
            expect(checker.checkString('var x = a.b')).to.have.no.errors();
            expect(checker.checkString('var x = a.π')).to.have.no.errors();
        });

        it('should not report for string that can\'t be identifier', function() {
            expect(checker.checkString('x["a-b"]')).to.have.no.errors();
            expect(checker.checkString('x["a.b"]')).to.have.no.errors();
            expect(checker.checkString('x["a b"]')).to.have.no.errors();
            expect(checker.checkString('x["1a"]')).to.have.no.errors();
            expect(checker.checkString('x["*"]')).to.have.no.errors();
            expect(checker.checkString('x["while"]')).to.have.no.errors();
        });
    });

    describe('true value with es3 enabled', function() {
        beforeEach(function() {
            checker.configure({ es3: true, requireDotNotation: true });
        });

        it('should not report literal subscription for es3 keywords or future reserved words', function() {
            expect(checker.checkString('var x = a[\'while\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'abstract\']')).to.have.no.errors();
        });
    });

    describe('option value {"allExcept":"snake_case"}', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: { allExcept: ['snake_case'] } });
        });

        it('should report literal subscription', function() {
            expect(checker.checkString('var x = a[\'b\']')).to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'camelA\']'))
              .to.have.one.validation.error.from('requireDotNotation');
        });

        it('should not report snake case identifier', function() {
            expect(checker.checkString('var x = a[\'snake_a\']')).to.have.no.errors();
        });

        it('should not report snake case identifier with trailing underscores', function() {
            expect(checker.checkString('var x = a[\'_snake_a\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'__snake_a\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'snake_a_\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'snake_a__\']')).to.have.no.errors();
        });

        it('should not report camel case identifier delimited with snake', function() {
            expect(checker.checkString('var x = a[\'camelA_camelB\']')).to.have.no.errors();
            expect(checker.checkString('var x = a[\'camelA_camelB_camelC\']')).to.have.no.errors();
        });

        it('should report camel case identifier with trailing underscores', function() {
            expect(checker.checkString('var x = a[\'_camelA\']'))
              .to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'__camelA\']'))
              .to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'camelA_\']'))
              .to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'camelA__\']'))
              .to.have.one.validation.error.from('requireDotNotation');
        });
    });

    describe('deprecated option value "except_snake_case"', function() {
        beforeEach(function() {
            checker.configure({ requireDotNotation: 'except_snake_case' });
        });

        it('should report literal subscription', function() {
            expect(checker.checkString('var x = a[\'b\']')).to.have.one.validation.error.from('requireDotNotation');
            expect(checker.checkString('var x = a[\'camelA\']'))
              .to.have.one.validation.error.from('requireDotNotation');
        });
    });
});
