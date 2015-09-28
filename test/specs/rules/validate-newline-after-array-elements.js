var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: true });
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

        it('should report for single-line array with many elements', function() {
            expect(checker.checkString('var x = [\n  1, 2, 3\n];')).to.have.error.count.equal(2);
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

        it('should report for multi-line array with many elements and one item on the first line', function() {
            expect(checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n'
                )).to.have.one.validation.error.from('validateNewlineAfterArrayElements');
        });

        it('should report for multi-line array with many elements and one item on the last line', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                    '4];\n'
                )).to.have.one.validation.error.from('validateNewlineAfterArrayElements');
        });

        it('should report for multi-line array with many elements on each line', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                        '1, 1,\n' +
                        '2, 2,\n' +
                        '3, 3\n' +
                    '];\n'
                )).to.have.error.count.equal(3);
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
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: 3 });
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });

        it('should report for multi-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                    '  1, 2\n' +
                    '];'
                )).to.have.one.validation.error.from('validateNewlineAfterArrayElements');
        });
    });

    describe('maximum 3', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { maximum: 3 } });
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });

        it('should report for multi-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [\n' +
                    '  1, 2\n' +
                    '];'
                )).to.have.one.validation.error.from('validateNewlineAfterArrayElements');
        });
    });

    describe('maximum 2, ignoreBrackets true', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { maximum: 2, ignoreBrackets: true } });
        });

        it('should report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.error.count.equal(2);
        });

        it('should report for multi-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [0,\n' +
                    '  1, 2, 3,\n' +
                    '4];'
                )).to.have.error.count.equal(2);
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
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { ignoreBrackets: true } });
        });

        it('should not report for one-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [1, 2, 3];'
                )).to.have.no.errors();
        });

        it('should report for multi-line array with 3 elements', function() {
            expect(checker.checkString(
                    'var x = [0,\n' +
                    '  1, 2, 3,\n' +
                    '4];'
                )).to.have.error.count.equal(2);
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
