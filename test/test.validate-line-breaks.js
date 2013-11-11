var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/validate-line-breaks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('LF', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'LF' });
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\r\n').getErrorCount(), 1);
        });
        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'LF', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\nz = 3;\r\n').getErrorCount(), 2);
        });
        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'LF' });
            assert(checker.checkString('x = 1;\ny = 2;\n').isEmpty());
        });
    });

    describe('CR', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'CR' });
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\r\n').getErrorCount(), 1);
        });
        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CR', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\rz = 3;\r\n').getErrorCount(), 2);
        });
        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CR' });
            assert(checker.checkString('x = 1;\ry = 2;\r').isEmpty());
        });
    });

    describe('CRLF', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'CRLF' });
            assert.strictEqual(checker.checkString('x = 1;\ny = 2;\n').getErrorCount(), 1);
        });
        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CRLF', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\ny = 2;\r\nz = 3;\n').getErrorCount(), 2);
        });
        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CRLF' });
            assert(checker.checkString('x = 1;\r\ny = 2;\r\n').isEmpty());
        });
    });
});
