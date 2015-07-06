var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/validate-line-breaks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not report single line files', function() {
        checker.configure({ validateLineBreaks: 'LF' });
        expect(checker.checkString('x = 1;')).to.have.no.errors();
    });

    describe.skip('LF', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'LF' });
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\r\n').getValidationErrorCount(), 1);
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'LF', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\nz = 3;\r\n').getValidationErrorCount(), 2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'LF' });
            expect(checker.checkString('x = 1;\ny = 2;\n')).to.have.no.errors();
        });
    });

    describe.skip('CR', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'CR' });
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\r\n').getValidationErrorCount(), 1);
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CR', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\rz = 3;\r\n').getValidationErrorCount(), 2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CR' });
            expect(checker.checkString('x = 1;\ry = 2;\r')).to.have.no.errors();
        });
    });

    describe.skip('CRLF', function() {
        it('should report invalid line break character once per file', function() {
            checker.configure({ validateLineBreaks: 'CRLF' });
            assert.strictEqual(checker.checkString('x = 1;\ny = 2;\n').getValidationErrorCount(), 1);
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CRLF', reportOncePerFile: false }});
            assert.strictEqual(checker.checkString('x = 1;\ny = 2;\r\nz = 3;\n').getValidationErrorCount(), 2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CRLF' });
            expect(checker.checkString('x = 1;\r\ny = 2;\r\n')).to.have.no.errors();
        });
    });
});
