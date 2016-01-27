var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/validate-aligned-function-parameters', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('no option', function() {
        beforeEach(function() {
            checker.configure({ validateAlignedFunctionParameters: true });
        });

        it('should not report a function with no parameters', function() {
            expect(checker.checkString(
                    'function a() {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '() => {}'
                )).to.have.no.errors();
        });

        it('should not report inline function parameters', function() {
            expect(checker.checkString(
                    'function a(b, c) {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '(b, c) => {}'
                )).to.have.no.errors();
        });

        it('should not report inline function parameters on a new line', function() {
            expect(checker.checkString(
                    'function a(\n' +
                        '  b, c\n' +
                    ') {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '(\n' +
                        '  b, c\n' +
                    ') => {}'
                )).to.have.no.errors();
        });

        it('should report unaligned multi-line function parameters', function() {
            expect(checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        'c\n' +
                    ') {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');

            expect(checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        'c\n' +
                    ') => {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');
        });

        it('should not report aligned multi-line function parameters', function() {
            expect(checker.checkString(
                    'function a(b,\n' +
                    '           c) {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '(b,\n' +
                    ' c) => {}'
                )).to.have.no.errors();
        });
    });

    describe('lineBreakAfterOpeningBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakAfterOpeningBrace: true
                }
            });
        });

        it('should not report a missing line break after the opening brace', function() {
            expect(checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        '  c) {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        '  c) => {}'
                )).to.have.no.errors();
        });

        it('should report a missing line break after the opening brace', function() {
            expect(checker.checkString(
                    'function a(b,\n' +
                    '           c) {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');

            expect(checker.checkString(
                    '(b,\n' +
                    ' c) => {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');
        });
    });

    describe('lineBreakBeforeClosingBrace', function() {
        beforeEach(function() {
            checker.configure({
                validateAlignedFunctionParameters: {
                    lineBreakBeforeClosingBrace: true
                }
            });
        });

        it('should not report a missing line break before the closing brace', function() {
            expect(checker.checkString(
                    'function a(\n' +
                        '  b,\n' +
                        '  c\n' +
                    ') {}'
                )).to.have.no.errors();

            expect(checker.checkString(
                    '(\n' +
                        '  b,\n' +
                        '  c\n' +
                    ') => {}'
                )).to.have.no.errors();
        });

        it('should report a missing line break before the closing brace', function() {
            expect(checker.checkString(
                    'function a(b,\n' +
                    '           c)\n' + ' {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');

            expect(checker.checkString(
                    '(b,\n' +
                    ' c) =>\n' + ' {}'
                )).to.have.one.validation.error.from('validateAlignedFunctionParameters');
        });
    });
});
