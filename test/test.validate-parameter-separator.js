var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/validate-parameter-separator', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('(comma)', function() {
        it('should report unexpected space for function a(b, c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b, c) {}').getErrorCount(), 1);
        });
        it('should report unexpected space for function a(b ,c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b ,c) {}').getErrorCount(), 1);
        });
        it('should report 2 unexpected spaces for function a(b , c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b , c) {}').getErrorCount(), 2);
        });
        it('should not report any errors for function a(b,c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b,c) {}').getErrorCount(), 0);
        });
        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b,\nc) {}').getErrorCount(), 0);
        });
        it('should not report any errors for function a(b<line-break>,c) {}', function() {
            checker.configure({ validateParameterSeparator: ',' });
            assert.strictEqual(checker.checkString('function a(b\n,c) {}').getErrorCount(), 0);
        });
    });

    describe('(comma space)', function() {
        it('should report unexpected space for function a(b , c) {}', function() {
            checker.configure({ validateParameterSeparator: ', ' });
            assert.strictEqual(checker.checkString('function a(b , c) {}').getErrorCount(), 1);
        });
        it('should report missing space for function a(b,c) {}', function() {
            checker.configure({ validateParameterSeparator: ', ' });
            assert.strictEqual(checker.checkString('function a(b,c) {}').getErrorCount(), 1);
        });
        it('should not report any errors for function a(b, c) {}', function() {
            checker.configure({ validateParameterSeparator: ', ' });
            assert.strictEqual(checker.checkString('function a(b, c) {}').getErrorCount(), 0);
        });
        it('should not report any errors for function a(b<line-break>, c) {}', function() {
            checker.configure({ validateParameterSeparator: ', ' });
            assert.strictEqual(checker.checkString('function a(b\n, c) {}').getErrorCount(), 0);
        });
    });

    describe('(space comma)', function() {
        it('should report unexpected space for function a(b , c) {}', function() {
            checker.configure({ validateParameterSeparator: ' ,' });
            assert.strictEqual(checker.checkString('function a(b , c) {}').getErrorCount(), 1);
        });
        it('should report missing space for function a(b,c) {}', function() {
            checker.configure({ validateParameterSeparator: ' ,' });
            assert.strictEqual(checker.checkString('function a(b,c) {}').getErrorCount(), 1);
        });
        it('should not report any errors for function a(b ,c) {}', function() {
            checker.configure({ validateParameterSeparator: ' ,' });
            assert.strictEqual(checker.checkString('function a(b ,c) {}').getErrorCount(), 0);
        });
        it('should not report any errors for function a(b,<line-break>c) {}', function() {
            checker.configure({ validateParameterSeparator: ' ,' });
            assert.strictEqual(checker.checkString('function a(b ,\nc) {}').getErrorCount(), 0);
        });
    });

    describe('(space comma space)', function() {
        it('should report missing space for function a(b, c) {}', function() {
            checker.configure({ validateParameterSeparator: ' , ' });
            assert.strictEqual(checker.checkString('function a(b, c) {}').getErrorCount(), 1);
        });
        it('should report missing space for function a(b ,c) {}', function() {
            checker.configure({ validateParameterSeparator: ' , ' });
            assert.strictEqual(checker.checkString('function a(b ,c) {}').getErrorCount(), 1);
        });
        it('should report 2 missing spaces for function a(b,c) {}', function() {
            checker.configure({ validateParameterSeparator: ' , ' });
            assert.strictEqual(checker.checkString('function a(b,c) {}').getErrorCount(), 2);
        });
        it('should not report any errors for function a(b , c) {}', function() {
            checker.configure({ validateParameterSeparator: ' , ' });
            assert.strictEqual(checker.checkString('function a(b , c) {}').getErrorCount(), 0);
        });
    });
});
