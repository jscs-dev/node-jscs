var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/validate-parameter-separator', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('accepts valid separator', function() {
        var validSeparators = [
            ',',
            ' ,',
            ', ',
            ' , '
        ];

        validSeparators.forEach(function(sep) {
            expect(function() {
                checker.configure({ validateParameterSeparator: sep });
            }).to.not.throw();
        });
    });

    it('rejects invalid separator', function() {
        var invalidSeparators = [
            'x,',
            ',x',
            'x,x',
            '  ,',
            ',  ',
            true
        ];

        invalidSeparators.forEach(function(sep) {
            expect(function() {
                checker.configure({ validateParameterSeparator: sep });
            }).to.throw('AssertionError');
        });
    });

    describe('(comma)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ',' });
        });

        it('should report unexpected space for function a(b, c) {}', function() {
            expect(checker.checkString('function a(b, c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should validate class methods', function() {
            expect(checker.checkString('class a { constructor(a, b) {} }'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report unexpected space for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report 2 unexpected spaces for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.error.count.equal(2);
        });

        it('should not report any errors for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b,\nc) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b<line-break>,c) {}', function() {
            expect(checker.checkString('function a(b\n,c) {}')).to.have.no.errors();
        });

        it('should report errors for function a(b<space><space>,c) {}', function() {
            expect(checker.checkString('function a(b  ,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b,  c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,  c) {}')).to.have.error.count.equal(2);
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.error.count.equal(2);
        });

    });

    describe('(comma space)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ', ' });
        });

        it('should report unexpected space for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should validate class methods', function() {
            expect(checker.checkString('class a { constructor(a , b) {} }'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report missing space for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should not report any errors for function a(b, c) {}', function() {
            expect(checker.checkString('function a(b, c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b<line-break>, c) {}', function() {
            expect(checker.checkString('function a(b\n, c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b,\nc) {}')).to.have.no.errors();
        });

        it('should report errors for function a(b,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b,  c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b,<space><space><space>c) {}', function() {
            expect(checker.checkString('function a(b,   c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space>,<space><space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,   c) {}')).to.have.error.count.equal(2);
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.error.count.equal(2);
        });

    });

    describe('(space comma)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ' ,' });
        });

        it('should report unexpected space for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should validate class methods', function() {
            expect(checker.checkString('class a { constructor(a , b) {} }'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report missing space for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should not report any errors for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b<line-break>,c) {}', function() {
            expect(checker.checkString('function a(b\n,c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b ,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b ,\nc) {}')).to.have.no.errors();
        });

        it('should report errors for function a(b<space><space>,c) {}', function() {
            expect(checker.checkString('function a(b  ,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space><space><space>,c) {}', function() {
            expect(checker.checkString('function a(b   ,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space><space><space>,<space>c) {}', function() {
            expect(checker.checkString('function a(b   , c) {}')).to.have.error.count.equal(2);
        });

    });

    describe('(space comma space)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ' , ' });
        });

        it('should report missing space for function a(b, c) {}', function() {
            expect(checker.checkString('function a(b, c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should validate class methods', function() {
            expect(checker.checkString('class a { constructor(a, b) {} }'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report missing space for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report 2 missing spaces for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.error.count.equal(2);
        });

        it('should not report any errors for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b<line-break>, c) {}', function() {
            expect(checker.checkString('function a(b\n, c) {}')).to.have.no.errors();
        });

        it('should not report any errors for function a(b ,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b ,\nc) {}')).to.have.no.errors();
        });

        it('should report errors for function a(b<space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,  c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space><space>,<space>c) {}', function() {
            expect(checker.checkString('function a(b  , c) {}'))
              .to.have.one.validation.error.from('validateParameterSeparator');
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.error.count.equal(2);
        });

    });
});
