var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-space-between-arguments', function() {
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
            ' , ',
        ];

        validSeparators.forEach(function(sep) {
            assert.doesNotThrow(function() {
                checker.configure({ requireSpaceBetweenArguments: sep });
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
        ];

        invalidSeparators.forEach(function(sep) {
            assert.throws(function() {
                checker.configure({ requireSpaceBetweenArguments: sep });
            }, assert.AssertionError);
        });
    });

    describe('(comma)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBetweenArguments: ',' });
        });

        it('should report unexpected space for a(b, c);', function() {
            assert.strictEqual(checker.checkString('a(b, c);').getErrorCount(), 1);
        });

        it('should report unexpected space for a(b ,c);', function() {
            assert.strictEqual(checker.checkString('a(b ,c);').getErrorCount(), 1);
        });

        it('should report 2 unexpected spaces for a(b , c);', function() {
            assert.strictEqual(checker.checkString('a(b , c);').getErrorCount(), 2);
        });

        it('should not report any errors for a(b,c);', function() {
            assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 0);
        });

        it('should not report any errors for a(b,<line-break>c);', function() {
            assert.strictEqual(checker.checkString('a(b,\nc);').getErrorCount(), 0);
        });

        it('should not report any errors for a(b<line-break>,c);', function() {
            assert.strictEqual(checker.checkString('a(b\n,c);').getErrorCount(), 0);
        });

        it('should report errors for a(b<space><space>,c);', function() {
            assert.strictEqual(checker.checkString('a(b  ,c);').getErrorCount(), 1);
        });

        it('should report errors for a(b,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b,  c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space>,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b ,  c);').getErrorCount(), 2);
        });

        it('should report errors for a(b<space><space>,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b  ,  c);').getErrorCount(), 2);
        });

    });

    describe('(comma space)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBetweenArguments: ', ' });
        });

        it('should report unexpected space for a(b , c);', function() {
            assert.strictEqual(checker.checkString('a(b , c);').getErrorCount(), 1);
        });

        it('should report missing space for a(b,c);', function() {
            assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 1);
        });

        it('should not report any errors for a(b, c);', function() {
            assert.strictEqual(checker.checkString('a(b, c);').getErrorCount(), 0);
        });

        it('should not report any errors for a(b<line-break>, c);', function() {
            assert.strictEqual(checker.checkString('a(b\n, c);').getErrorCount(), 0);
        });

        it('should report errors for a(b,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b,  c);').getErrorCount(), 1);
        });

        it('should report errors for a(b,<space><space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b,   c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space>,<space><space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b ,   c);').getErrorCount(), 2);
        });

        it('should report errors for a(b<space><space>,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b  ,  c);').getErrorCount(), 2);
        });

    });

    describe('(space comma)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBetweenArguments: ' ,' });
        });

        it('should report unexpected space for a(b , c);', function() {
            assert.strictEqual(checker.checkString('a(b , c);').getErrorCount(), 1);
        });

        it('should report missing space for a(b,c);', function() {
            assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 1);
        });

        it('should not report any errors for a(b ,c);', function() {
            assert.strictEqual(checker.checkString('a(b ,c);').getErrorCount(), 0);
        });

        it('should not report any errors for a(b,<line-break>c);', function() {
            assert.strictEqual(checker.checkString('a(b ,\nc);').getErrorCount(), 0);
        });

        it('should report errors for a(b<space><space>,c);', function() {
            assert.strictEqual(checker.checkString('a(b  ,c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space><space><space>,c);', function() {
            assert.strictEqual(checker.checkString('a(b   ,c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space><space><space>,<space>c);', function() {
            assert.strictEqual(checker.checkString('a(b   , c);').getErrorCount(), 2);
        });

    });

    describe('(space comma space)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBetweenArguments: ' , ' });
        });

        it('should report missing space for a(b, c);', function() {
            assert.strictEqual(checker.checkString('a(b, c);').getErrorCount(), 1);
        });

        it('should report missing space for a(b ,c);', function() {
            assert.strictEqual(checker.checkString('a(b ,c);').getErrorCount(), 1);
        });

        it('should report 2 missing spaces for a(b,c);', function() {
            assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 2);
        });

        it('should not report any errors for a(b , c);', function() {
            assert.strictEqual(checker.checkString('a(b , c);').getErrorCount(), 0);
        });

        it('should report errors for a(b<space>,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b ,  c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space><space>,<space>c);', function() {
            assert.strictEqual(checker.checkString('a(b  , c);').getErrorCount(), 1);
        });

        it('should report errors for a(b<space><space>,<space><space>c);', function() {
            assert.strictEqual(checker.checkString('a(b  ,  c);').getErrorCount(), 2);
        });

    });
});
