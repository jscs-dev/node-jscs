var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-spaces-inside-array-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw when given an number', function() {
            assert.throws(function() {
                checker.configure({ requireSpacesInsideArrayBrackets: 2 });
            });
        });
    });

    describe.skip('"all"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        });

        it('should report missing space after opening brace', function() {
            expect(checker.checkString('var x = [1 ];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing space before closing brace', function() {
            expect(checker.checkString('var x = [ 1];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = [1];').getValidationErrorCount() === 2);
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('var x = [ 1 ];')).to.have.no.errors();
        });

        it('should not report for empty array', function() {
            expect(checker.checkString('var x = [];')).to.have.no.errors();
        });

        it('should report for nested array', function() {
            assert(checker.checkString('var x = [[ 1 ]];').getValidationErrorCount() === 2);
        });

        it('should report anything for empty array', function() {
            expect(checker.checkString('[];')).to.have.no.errors();
        });

        it('should not report with comments before the first element', function() {
            assert(checker.checkString(
                'var x = [ /*A*/ 1, 2 ]'
            ).isEmpty());
        });

        it('should not report with comments after the last element', function() {
            assert(checker.checkString(
                'var x = [ 1, 2, /*Z*/ ]'
            ).isEmpty());
        });
    });

    describe.skip('"allButNested"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        });

        it('should report missing space after opening brace', function() {
            expect(checker.checkString('var x = [1 ];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing space before closing brace', function() {
            expect(checker.checkString('var x = [ 1];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = [1];').getValidationErrorCount() === 2);
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('var x = [ 1 ];')).to.have.no.errors();
        });

        it('should not report for nested array', function() {
            expect(checker.checkString('var x = [[ 1 ], [ 2 ]];')).to.have.no.errors();
        });

        it('should report anything for empty array', function() {
            expect(checker.checkString('[[]];')).to.have.no.errors();
        });
    });

    describe.skip('exceptions', function() {
        it('should not report missing space for parentheses', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['{', '}']
                }
            });

            assert(checker.checkString('var x = [1];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [{ a: 1 }];')).to.have.no.errors();
        });

        it('should report missing space for the array brackets', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['[', ']']
                }
            });

            assert(checker.checkString('var x = [{}];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [[]];')).to.have.no.errors();
        });

        it('should not report missing space in both cases', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['(', ')']
                }
            });

            assert(checker.checkString('var x = [{ a: 1 }];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [(1)];')).to.have.no.errors();
        });
    });

    describe.skip('comments', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        });

        it('should report missing space after comment', function() {
            expect(checker.checkString('var x = [ 1 /*,2*/];'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report with space after comment', function() {
            expect(checker.checkString('var x = [ 1 /*,2*/ ];')).to.have.no.errors();
        });

        it('should report missing space before comment', function() {
            expect(checker.checkString('var x = [/*0,*/ 1 ];'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report with space before comment', function() {
            expect(checker.checkString('var x = [ /*0,*/ 1 ];')).to.have.no.errors();
        });

        it('should report missing space before and after comments', function() {
            assert(checker.checkString('var x = [/*0,*/ 1 /*,2*/];').getValidationErrorCount() === 2);
        });

        it('should not report with space before comment', function() {
            expect(checker.checkString('var x = [ /*0,*/ 1 /*,2*/ ];;')).to.have.no.errors();
        });

    });
});
