var Checker = require('../../../lib/checker');
var assert = require('assert');

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
            assert(checker.checkString('var x, y;').getErrorCount() === 1);
        });

        it('should report multiple var decl with assignment', function() {
            assert(checker.checkString('var x = 1, y = 2;').getErrorCount() === 1);
        });

        it('should not report single var decl', function() {
            assert(checker.checkString('var x;').isEmpty());
        });

        it('should not report separated var decl', function() {
            assert(checker.checkString('var x; var y;').isEmpty());
        });

        it('should not report multiple var decl in for statement', function() {
            assert(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}').isEmpty());
        });

        it('should report multiple var decl with some assignment', function() {
            assert(checker.checkString('var x, y = 2, z;').getErrorCount() === 1);
        });

        it('should report separated var decl inside switch', function() {
            assert(checker.checkString('switch (1) { case 1: var a, b; }').getErrorCount() === 1);
        });
    });

    describe('strict', function() {
        it('should report multiple var decl in a for statement if given the "strict" value (#46)', function() {
            checker.configure({ disallowMultipleVarDecl: 'strict' });
            assert(!checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}').isEmpty());
        });
    });

    describe('exceptUndefined', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: 'exceptUndefined' });
        });

        it('should not report multiple var decl', function() {
            assert(checker.checkString('var x, y;').isEmpty());
        });

        it('should report multiple var decl with assignment', function() {
            assert(checker.checkString('var x = 1, y = 2;').getErrorCount() === 1);
        });

        it('should not report single var decl', function() {
            assert(checker.checkString('var x;').isEmpty());
        });

        it('should not report separated var decl', function() {
            assert(checker.checkString('var x; var y;').isEmpty());
        });

        it('should not report multiple var decl in for statement', function() {
            assert(checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}').isEmpty());
        });

        it('should report multiple var decl with some assignment', function() {
            assert(checker.checkString('var x, y = 2, z;').getErrorCount() === 1);
        });
    });

    describe('exceptRequire', function() {
        beforeEach(function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['require'] } });
        });
        it('should not report multiple var decls with require', function() {
            assert(checker.checkString('var first = require("first"), second = require("second");').isEmpty());
        });
        it('should report multiple var decls with require mixed with normal', function() {
            assert.equal(1, checker.checkString('var first = require("first"), second = 1;').getErrorCount());
        });
        it('should report multiple var decls', function() {
            assert.equal(1, checker.checkString('var x, y;').getErrorCount());
        });
        it('should not report consecutive var decls', function() {
            assert(checker.checkString('var x; var y;').isEmpty());
        });
    });

    describe('options as object', function() {
        it('should accept undefined as allExcept value', function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['undefined'] } });

            assert(checker.checkString('var x, y;').isEmpty());
        });
        it('should accept require and undefined as allExcept value', function() {
            checker.configure({ disallowMultipleVarDecl: { allExcept: ['undefined', 'require'] } });

            assert(checker.checkString('var a = require("a"), b = require("b"), x, y, z;').isEmpty());
            assert.equal(
                1,
                checker.checkString('var a = require("a"), b = require("b"), x, y, c = 1;').getErrorCount()
            );
        });
        it('should accept strict as option', function() {
            checker.configure({ disallowMultipleVarDecl: { strict: true } });

            assert(!checker.checkString('for (var i = 0, j = arr.length; i < j; i++) {}').isEmpty());
        });
        it('should accept all options at the same time', function() {
            checker.configure({ disallowMultipleVarDecl: { strict: true, allExcept: ['undefined', 'require'] } });

            assert(!checker.checkString(
                'var a = require("a"), b = require("b"), x, y;' +
                'for (var i = 0, j = arr.length; i < j; i++) {}'
            ).isEmpty());
        });
    });
});
