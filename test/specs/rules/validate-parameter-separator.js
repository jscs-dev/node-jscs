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
            });
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
            expect(checker.checkString('function a(b, c) {}')).to.have.one.validation.error();
        });

        it('should report unexpected space for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}')).to.have.one.validation.error();
        });

        it('should report 2 unexpected spaces for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report any errors for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b,\nc) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b<line-break>,c) {}', function() {
            expect(checker.checkString('function a(b\n,c) {}')).to.have.no.validation.errors();
        });

        it('should report errors for function a(b<space><space>,c) {}', function() {
            expect(checker.checkString('function a(b  ,c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b,  c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,  c) {}')).to.have.validation.error.count.which.equals(2);
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.validation.error.count.which.equals(2);
        });

    });

    describe('(comma space)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ', ' });
        });

        it('should report unexpected space for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.one.validation.error();
        });

        it('should report missing space for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.one.validation.error();
        });

        it('should not report any errors for function a(b, c) {}', function() {
            expect(checker.checkString('function a(b, c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b<line-break>, c) {}', function() {
            expect(checker.checkString('function a(b\n, c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b,\nc) {}')).to.have.no.validation.errors();
        });

        it('should report errors for function a(b,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b,  c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b,<space><space><space>c) {}', function() {
            expect(checker.checkString('function a(b,   c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space>,<space><space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,   c) {}')).to.have.validation.error.count.which.equals(2);
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.validation.error.count.which.equals(2);
        });

    });

    describe('(space comma)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ' ,' });
        });

        it('should report unexpected space for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.one.validation.error();
        });

        it('should report missing space for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.one.validation.error();
        });

        it('should not report any errors for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b<line-break>,c) {}', function() {
            expect(checker.checkString('function a(b\n,c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b ,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b ,\nc) {}')).to.have.no.validation.errors();
        });

        it('should report errors for function a(b<space><space>,c) {}', function() {
            expect(checker.checkString('function a(b  ,c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space><space><space>,c) {}', function() {
            expect(checker.checkString('function a(b   ,c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space><space><space>,<space>c) {}', function() {
            expect(checker.checkString('function a(b   , c) {}')).to.have.validation.error.count.which.equals(2);
        });

    });

    describe('(space comma space)', function() {
        beforeEach(function() {
            checker.configure({ validateParameterSeparator: ' , ' });
        });

        it('should report missing space for function a(b, c) {}', function() {
            expect(checker.checkString('function a(b, c) {}')).to.have.one.validation.error();
        });

        it('should report missing space for function a(b ,c) {}', function() {
            expect(checker.checkString('function a(b ,c) {}')).to.have.one.validation.error();
        });

        it('should report 2 missing spaces for function a(b,c) {}', function() {
            expect(checker.checkString('function a(b,c) {}')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report any errors for function a(b , c) {}', function() {
            expect(checker.checkString('function a(b , c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b<line-break>, c) {}', function() {
            expect(checker.checkString('function a(b\n, c) {}')).to.have.no.validation.errors();
        });

        it('should not report any errors for function a(b ,<line-break>c) {}', function() {
            expect(checker.checkString('function a(b ,\nc) {}')).to.have.no.validation.errors();
        });

        it('should report errors for function a(b<space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b ,  c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space><space>,<space>c) {}', function() {
            expect(checker.checkString('function a(b  , c) {}')).to.have.one.validation.error();
        });

        it('should report errors for function a(b<space><space>,<space><space>c) {}', function() {
            expect(checker.checkString('function a(b  ,  c) {}')).to.have.validation.error.count.which.equals(2);
        });

    });
});
