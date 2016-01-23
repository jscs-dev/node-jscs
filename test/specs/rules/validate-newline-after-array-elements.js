var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/validate-newline-after-array-elements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('{ maximum: true }', function() {
        it('should throws', function() {
            expect(function() {
                checker.configure({ validateNewlineAfterArrayElements: { maximum: true } });
            }).to.throw();
        });
    });

    describe('true option', function() {
        var rules = { validateNewlineAfterArrayElements: true };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report for multi-line-line array with many elements',
            rules: rules,
            errors: 2,
            input: 'var x = [\n  1, 2, 3\n];',
            output: 'var x = [\n  1,\n 2,\n 3\n];'
        });

        reportAndFix({
            name: 'should report for multi-line array with many elements and one item on the first line',
            rules: rules,
            errors: 1,
            input: 'var x = [0,\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n',
            output: 'var x = [\n' +
                        '0,\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n'
        });

        reportAndFix({
            name: 'should report for multi-line array with many elements and one item on the last line',
            rules: rules,
            errors: 1,
            input: 'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                    '4];\n',
            output: 'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                        '4\n' +
                    '];\n'
        });

        reportAndFix({
            name: 'should report for multi-line array with many elements on each line',
            rules: rules,
            errors: 3,
            input: 'var x = [\n' +
                        '1, 1,\n' +
                        '2, 2,\n' +
                        '3, 3\n' +
                    '];\n',
            output: 'var x = [\n' +
                        '1,\n' +
                        ' 1,\n' +
                        '2,\n' +
                        ' 2,\n' +
                        '3,\n' +
                        ' 3\n' +
                    '];\n'
        });

        it('should not report for empty array', function() {
            expect(checker.checkString('var x = [];')).to.have.no.errors();
        });

        it('should not report for single-line array with 1 item', function() {
            expect(checker.checkString('var x = [1];')).to.have.no.errors();
            expect(checker.checkString('var x = [{}];')).to.have.no.errors();
        });

        it('should not report for single-line array with many elements', function() {
            expect(checker.checkString('var x = [1, 2];')).to.have.no.errors();
            expect(checker.checkString('var x = [1, 2, 3];')).to.have.no.errors();
        });

        it('should not report for multi-line array without elements', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        '1\n' +
                    '];\n'
                )).to.have.no.errors();
        });

        it('should not report for multi-line array with many elements', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n'
                )).to.have.no.errors();
        });

        it('should not report for one-line array with many holes', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        ',\n' +
                        '1,\n' +
                        ',\n' +
                    '];\n'
                )).to.have.no.errors();
        });
    });

    describe('with value 3', function() {
        var rules = { validateNewlineAfterArrayElements: 3 };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });

        reportAndFix({
            name: 'should report for multi-line array with 3 elements',
            rules: rules,
            errors: 1,
            input: 'var x = [\n' +
                    '  1, 2\n' +
                    '];',
            output: 'var x = [\n' +
                    '  1,\n' +
                    ' 2\n' +
                    '];'
        });
    });

    describe('maximum 3', function() {
        var rules = { validateNewlineAfterArrayElements: { maximum: 3 } };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report for multi-line array with 3 elements',
            rules: rules,
            errors: 1,
            input: 'var x = [\n' +
                    '  1, 2\n' +
                    '];',
            output: 'var x = [\n' +
                    '  1,\n' +
                    ' 2\n' +
                    '];'
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });
    });

    describe('maximum 2, ignoreBrackets true', function() {
        var rules = { validateNewlineAfterArrayElements: { maximum: 2, ignoreBrackets: true } };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report for one-line array with 3 elements',
            rules: rules,
            errors: 2,
            input: 'var x = [1, 2, 3];',
            output: 'var x = [1,\n' +
                    ' 2,\n' +
                    ' 3];'
        });

        reportAndFix({
            name: 'should report for multi-line array with 3 elements',
            rules: rules,
            errors: 2,
            input: 'var x = [0,\n' +
                    ' 1, 2, 3,\n' +
                    '4];',
            output: 'var x = [0,\n' +
                    ' 1,\n' +
                    ' 2,\n' +
                    ' 3,\n' +
                    '4];'
        });

        it('should not report for multi-line array with elements on 2 lines', function() {
            expect(checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                    '2,];\n'
                )).to.have.no.errors();
        });
    });

    describe('ignoreBrackets true', function() {
        var rules = { validateNewlineAfterArrayElements: { ignoreBrackets: true } };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report for multi-line array with 3 elements',
            rules: rules,
            errors: 2,
            input: 'var x = [0,\n' +
                    ' 1, 2, 3,\n' +
                    '4];',
            output: 'var x = [0,\n' +
                    ' 1,\n' +
                    ' 2,\n' +
                    ' 3,\n' +
                    '4];'
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });

        it('should not report for multi-line array with elements on 2 lines', function() {
            expect(checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                    '2,];\n'
                )).to.have.no.errors();
        });
    });
});
