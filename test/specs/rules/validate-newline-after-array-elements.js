var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/validate-newline-after-array-elements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('{ maximum: true }', function() {
        it('should throws', function() {
            assert.throws(function() {
                checker.configure({ validateNewlineAfterArrayElements: { maximum: true } });
            });
        });
    });

    describe.skip('true option', function() {
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
            assert.equal(checker.checkString('var x = [\n  1, 2, 3\n];').getValidationErrorCount(), 2);
        });

        it('should not report for multi-line array without elements', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1\n' +
                    '];\n'
                ).isEmpty()
            );
        });

        it('should not report for multi-line array with many elements', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n'
                ).isEmpty()
            );
        });

        it('should report for multi-line array with many elements and one item on the first line', function() {
            assert(
                checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                        '2,\n' +
                        '3\n' +
                    '];\n'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report for multi-line array with many elements and one item on the last line', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1,\n' +
                        '2,\n' +
                        '3,\n' +
                    '4];\n'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report for multi-line array with many elements on each line', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        '1, 1,\n' +
                        '2, 2,\n' +
                        '3, 3\n' +
                    '];\n'
                ).getValidationErrorCount() === 3
            );
        });

        it('should not report for one-line array with many holes', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                        ',\n' +
                        '1,\n' +
                        ',\n' +
                    '];\n'
                ).isEmpty()
            );
        });
    });

    describe.skip('with value 3', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: 3 });
        });

        it('should not report for one-line array with 3 elements', function() {
            assert(
                checker.checkString(
                    'var x = [1, 2, 3];'
                ).isEmpty()
            );
        });

        it('should report for multi-line array with 3 elements', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                    '  1, 2\n' +
                    '];'
                ).getValidationErrorCount() === 1
            );
        });
    });

    describe.skip('maximum 3', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { maximum: 3 } });
        });

        it('should not report for one-line array with 3 elements', function() {
            assert(
                checker.checkString(
                    'var x = [1, 2, 3];'
                ).isEmpty()
            );
        });

        it('should report for multi-line array with 3 elements', function() {
            assert(
                checker.checkString(
                    'var x = [\n' +
                    '  1, 2\n' +
                    '];'
                ).getValidationErrorCount() === 1
            );
        });
    });

    describe.skip('maximum 2, ignoreBrackets true', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { maximum: 2, ignoreBrackets: true } });
        });

        it('should report for one-line array with 3 elements', function() {
            assert.equal(
                checker.checkString(
                    'var x = [1, 2, 3];'
                ).getValidationErrorCount(), 2
            );
        });

        it('should report for multi-line array with 3 elements', function() {
            assert.equal(
                checker.checkString(
                    'var x = [0,\n' +
                    '  1, 2, 3,\n' +
                    '4];'
                ).getValidationErrorCount(), 2
            );
        });

        it('should not report for multi-line array with elements on 2 lines', function() {
            assert(
                checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                    '2,];\n'
                ).isEmpty()
            );
        });
    });

    describe.skip('ignoreBrackets true', function() {
        beforeEach(function() {
            checker.configure({ validateNewlineAfterArrayElements: { ignoreBrackets: true } });
        });

        it('should not report for one-line array with 3 elements', function() {
            assert(
                checker.checkString(
                    'var x = [1, 2, 3];'
                ).isEmpty()
            );
        });

        it('should report for multi-line array with 3 elements', function() {
            assert.equal(
                checker.checkString(
                    'var x = [0,\n' +
                    '  1, 2, 3,\n' +
                    '4];'
                ).getValidationErrorCount(), 2
            );
        });

        it('should not report for multi-line array with elements on 2 lines', function() {
            assert(
                checker.checkString(
                    'var x = [0,\n' +
                        '1,\n' +
                    '2,];\n'
                ).isEmpty()
            );
        });
    });
});
