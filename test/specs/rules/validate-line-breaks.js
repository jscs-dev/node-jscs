var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;
var expect = require('chai').expect;

describe('rules/validate-line-breaks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not report single line files', function() {
        checker.configure({ validateLineBreaks: 'LF' });
        expect(checker.checkString('x = 1;')).to.have.no.errors();
    });

    describe('LF', function() {
        reportAndFix({
            name: 'invalid line break character once per file',
            rules: { validateLineBreaks: 'LF' },
            errors: 1,
            input: 'x = 1;\r\ny = 2;\r\n',
            output: 'x = 1;\ny = 2;\n'
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'LF', reportOncePerFile: false }});
            expect(checker.checkString('x = 1;\r\ny = 2;\nz = 3;\r\n')).to.have.error.count.equal(2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'LF' });
            expect(checker.checkString('x = 1;\ny = 2;\n')).to.have.no.errors();
        });
    });

    describe('CR', function() {
        reportAndFix({
            name: 'invalid line break character once per file',
            rules: { validateLineBreaks: 'CR' },
            errors: 1,
            input: 'x = 1;\r\ny = 2;\r\n',
            output: 'x = 1;\ry = 2;\r'
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CR', reportOncePerFile: false }});
            expect(checker.checkString('x = 1;\r\ny = 2;\rz = 3;\r\n')).to.have.error.count.equal(2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CR' });
            expect(checker.checkString('x = 1;\ry = 2;\r')).to.have.no.errors();
        });
    });

    describe('CRLF', function() {
        reportAndFix({
            name: 'invalid line break character once per file - LF -> CRLF',
            rules: { validateLineBreaks: 'CRLF' },
            errors: 1,
            input: 'x = 1;\ny = 2;\n',
            output: 'x = 1;\r\ny = 2;\r\n'
        });

        reportAndFix({
            name: 'invalid line break character once per file - CR -> CRLF',
            rules: { validateLineBreaks: 'CRLF' },
            errors: 1,
            input: 'x = 1;\ry = 2;\r',
            output: 'x = 1;\r\ny = 2;\r\n'
        });

        it('should report all invalid line break character', function() {
            checker.configure({ validateLineBreaks: { character: 'CRLF', reportOncePerFile: false }});
            expect(checker.checkString('x = 1;\ny = 2;\r\nz = 3;\n')).to.have.error.count.equal(2);
        });

        it('should not report invalid line break character', function() {
            checker.configure({ validateLineBreaks: 'CRLF' });
            expect(checker.checkString('x = 1;\r\ny = 2;\r\n')).to.have.no.errors();
        });
    });
});
