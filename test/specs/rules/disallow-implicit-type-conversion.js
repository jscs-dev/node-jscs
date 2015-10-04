var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-implicit-type-conversion', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option ["numeric"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['numeric'] });
        });

        it('should report implicit numeric conversion', function() {
            expect(checker.checkString('var x = +y;'))
              .to.have.one.validation.error.from('disallowImplicitTypeConversion');
        });

        it('should not report negative numbers', function() {
            expect(checker.checkString('var x = -y;')).to.have.no.errors();
        });
    });

    describe('option ["binary"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['binary'] });
        });

        it('should report implicit binary conversion', function() {
            expect(checker.checkString('var x = ~y;'))
              .to.have.one.validation.error.from('disallowImplicitTypeConversion');
        });
    });

    describe('option ["boolean"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['boolean'] });
        });

        it('should report implicit boolean conversion', function() {
            expect(checker.checkString('var x = !!y;'))
              .to.have.one.validation.error.from('disallowImplicitTypeConversion');
        });
    });

    describe('option ["string"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['string'] });
        });

        it('should report implicit string conversion on rhs', function() {
            expect(checker.checkString('var x = y + \'\';'))
              .to.have.one.validation.error.from('disallowImplicitTypeConversion');
        });

        it('should report implicit string conversion on lhs', function() {
            expect(checker.checkString('var x = \'\' + y;'))
              .to.have.one.validation.error.from('disallowImplicitTypeConversion');
        });

        it('should not report string literal', function() {
            expect(checker.checkString('var x = \'hi\' + y;')).to.have.no.errors();
        });

        it('should not report operations other than +', function() {
            expect(checker.checkString('var x = \'\' * y;')).to.have.no.errors();
        });

        it('should not report concatination with two literals (#1538)', function() {
            expect(checker.checkString('"" + "string";')).to.have.no.errors();
        });
    });
});
