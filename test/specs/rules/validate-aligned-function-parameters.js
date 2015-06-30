var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/validate-aligned-function-parameters', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('no option', function() {
        beforeEach(function() {
            checker.configure({ validateAlignedFunctionParameters: true });
        });

        it('should not report a function with no parameters', function() {
            assert(
                checker.checkString(
                    'function a() {}'
                ).isEmpty()
            );
        });

        it('should not report inline function parameters', function() {
            assert(
                checker.checkString(
                    'function a(b, c) {}'
                ).isEmpty()
            );
        });

        it('should not report inline function parameters on a new line', function() {
            assert(
                checker.checkString(
                    'function a(\n' +
                        '  b, c\n' +
                    ') {}'
                ).isEmpty()
            );
        });

        it('should report unaligned multi-line function parameters', function() {
            assert(
                checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        'c\n' +
                    ') {}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should not report aligned multi-line function parameters', function() {
            assert(
                checker.checkString(
                    'function a(b,\n' +
                    '           c) {}'
                ).isEmpty()
            );
        });
    });

    describe.skip('lineBreakAfterOpeningBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakAfterOpeningBrace: true
                }
            });
        });

        it('should not report a missing line break after the opening brace', function() {
            assert(
                checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        '  c) {}'
                ).isEmpty()
            );
        });

        it('should report a missing line break after the opening brace', function() {
            assert(
                checker.checkString(
                    'function a(b,\n' +
                    '           c) {}'
                ).getValidationErrorCount() === 1
            );
        });
    });

    describe.skip('lineBreakBeforeClosingBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakBeforeClosingBrace: true
                }
            });
        });

        it('should not report a missing line break before the closing brace', function() {
            assert(
                checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        '  c\n' +
                    ') {}'
                ).isEmpty()
            );
        });

        it('should report a missing line break before the closing brace', function() {
            assert(
                checker.checkString(
                    'function a(b,\n' +
                    '           c)\n' + ' {}'
                ).getValidationErrorCount() === 1
            );
        });
    });
});
