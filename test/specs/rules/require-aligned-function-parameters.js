var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-aligned-function-parameters', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('no option', function() {
        beforeEach(function() {
            checker.configure({ requireAlignedFunctionParameters: true });
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
                ).getErrorCount() === 1
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

    describe('lineBreakAfterOpeningBrace', function() {
        beforeEach(function() {
            checker.configure({
                requireAlignedFunctionParameters: {
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
                ).getErrorCount() === 1
            );
        });
    });

    describe('lineBreakBeforeClosingBrace', function() {
        beforeEach(function() {
            checker.configure({
                requireAlignedFunctionParameters: {
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
                ).getErrorCount() === 1
            );
        });
    });
});
