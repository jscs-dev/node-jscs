var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/validate-aligned-function-parameters', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('no option', function() {
        beforeEach(function() {
            checker.configure({ validateAlignedFunctionParameters: true, esnext: true });
        });

        it('should not report a function with no parameters', function() {
            assert(
                checker.checkString(
                    'function a() {}'
                ).isEmpty()
            );

            assert(
                checker.checkString(
                    '() => {}'
                ).isEmpty()
            );
        });

        it('should not report inline function parameters', function() {
            assert(
                checker.checkString(
                    'function a(b, c) {}'
                ).isEmpty()
            );

            assert(
                checker.checkString(
                    '(b, c) => {}'
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

            assert(
                checker.checkString(
                    '(\n' +
                        '  b, c\n' +
                    ') => {}'
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

            assert(
                checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        'c\n' +
                    ') => {}'
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

            assert(
                checker.checkString(
                    '(b,\n' +
                    ' c) => {}'
                ).isEmpty()
            );
        });
    });

    describe('lineBreakAfterOpeningBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakAfterOpeningBrace: true
                },
                esnext: true
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

            assert(
                checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        '  c) => {}'
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

            assert(
                checker.checkString(
                    '(b,\n' +
                    ' c) => {}'
                ).getErrorCount() === 1
            );
        });
    });

    describe('lineBreakBeforeClosingBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakBeforeClosingBrace: true
                },
                esnext: true
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

            assert(
                checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        '  c\n' +
                    ') => {}'
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

            assert(
                checker.checkString(
                    '(b,\n' +
                    ' c) =>\n' + ' {}'
                ).getErrorCount() === 1
            );
        });
    });
});
