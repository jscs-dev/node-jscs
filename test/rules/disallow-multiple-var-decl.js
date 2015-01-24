var Checker = require('../../lib/checker');
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
});
