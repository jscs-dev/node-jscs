var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-multiple-var-decl', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: true });
        });

        it('should report multiple var decl', function() {
            expect(checker.checkString('var x, y;')).to.have.one.validation.error.from('disallowMultipleVarDecl');
        });

        it('should report multiple var decl with assignment', function() {
            expect(checker.checkString('var x = 1, y = 2;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });

        it('should not report single var decl', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });

        it('should not report separated var decl', function() {
            expect(checker.checkString('var x; var y;')).to.have.no.errors();
        });

        it('should not report multiple var decl in for statement', function() {
            expect(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}')).to.have.no.errors();
        });

        it('should report multiple var decl with some assignment', function() {
            expect(checker.checkString('var x, y = 2, z;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });

        it('should report separated var decl inside switch', function() {
            expect(checker.checkString('switch (1) { case 1: var a, b; }'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
    });

    describe('strict', function() {
        it('should report multiple var decl in a for statement if given the "strict" value (#46)', function() {
            checker.configure({ disallowMultipleVarDecl: 'strict' });
            expect(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}')).to.have.errors();
        });
    });

    describe('exceptUndefined', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: 'exceptUndefined' });
        });

        it('should not report multiple var decl', function() {
            expect(checker.checkString('var x, y;')).to.have.no.errors();
        });

        it('should report multiple var decl with assignment', function() {
            expect(checker.checkString('var x = 1, y = 2;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });

        it('should not report single var decl', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });

        it('should not report separated var decl', function() {
            expect(checker.checkString('var x; var y;')).to.have.no.errors();
        });

        it('should not report multiple var decl in for statement', function() {
            expect(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}')).to.have.no.errors();
        });

        it('should report multiple var decl with some assignment', function() {
            expect(checker.checkString('var x, y = 2, z;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
    });

    describe('exceptRequire', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['require'] } });
        });
        it('should not report multiple var decls with require', function() {
            expect(checker.checkString('var first = require("first"), second = require("second");'))
              .to.have.no.errors();
        });
        it('should report multiple var decls with require mixed with normal', function() {
            expect(checker.checkString('var first = require("first"), second = 1;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');

            var test = 'var first = require("first"), second = 1, third = require("foo").Foo';
            expect(checker.checkString(test)).to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
        it('should report multiple var decls with require mixed with undefined', function() {
            var test = 'var first = require("first"), second = require("foo").Foo, third;';
            expect(checker.checkString(test)).to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
        it('should report multiple var decls', function() {
            expect(checker.checkString('var x, y;')).to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
        it('should not report consecutive var decls', function() {
            expect(checker.checkString('var x; var y;')).to.have.no.errors();
        });
        it('should not report multiple var decls sourced from required', function() {
            expect(checker.checkString('var x = require("fs"), y = require("fs").File;')).to.have.no.errors();
            expect(checker.checkString('var x = require("fs").File, y = require("fs").foo();')).to.have.no.errors();
            expect(checker.checkString('var x = require("fs"), y = require("fs").some.long().chain.test();'))
                .to.have.no.errors();
            expect(checker.checkString('var x = require("fs"), y = require("fs").some().long().chain.test;'))
                .to.have.no.errors();
        });
    });

    describe('options as object', function() {
        it('should accept undefined as allExcept value', function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['undefined'] } });

            expect(checker.checkString('var x, y;')).to.have.no.errors();
        });
        it('should accept require and undefined as allExcept value', function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['undefined', 'require'] } });

            expect(checker.checkString('var a = require("a"), b = require("b").getMe(), x, y, z;')).to.have.no.errors();
            expect(checker.checkString('var a = require("a").Instance, b = require("b"), x, y, c = 1;'))
              .to.have.one.validation.error.from('disallowMultipleVarDecl');
        });
        it('should accept strict as option', function() {
            checker.configure({ disallowMultipleVarDecl: { strict: true } });

            expect(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}')).to.have.errors();
        });
        it('should accept all options at the same time', function() {
            checker.configure({ disallowMultipleVarDecl: { strict: true, allExcept: ['undefined', 'require'] } });

            expect(checker.checkString(
                'var a = require("a"), b = require("b"), x, y;' +
                'for (var i = 0, j = arr.length; i < j; i++) {}'
            )).to.have.errors();
        });
    });
});
