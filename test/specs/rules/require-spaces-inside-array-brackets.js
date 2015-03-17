var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-array-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('"all"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideArrayBrackets: 'all' });
        });

        it('should report missing space after opening brace', function() {
            assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
        });

        it('should report missing space before closing brace', function() {
            assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
        });

        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = [1];').getErrorCount() === 2);
        });

        it('should not report with spaces', function() {
            assert(checker.checkString('var x = [ 1 ];').isEmpty());
        });

        it('should not report for empty array', function() {
            assert(checker.checkString('var x = [];').isEmpty());
        });

        it('should report for nested array', function() {
            assert(checker.checkString('var x = [[ 1 ]];').getErrorCount() === 2);
        });

        it('should report anything for empty array', function() {
            assert(checker.checkString('[];').isEmpty());
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

    describe('"allButNested"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideArrayBrackets: 'allButNested' });
        });

        it('should report missing space after opening brace', function() {
            assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
        });

        it('should report missing space before closing brace', function() {
            assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
        });

        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = [1];').getErrorCount() === 2);
        });

        it('should not report with spaces', function() {
            assert(checker.checkString('var x = [ 1 ];').isEmpty());
        });

        it('should not report for nested array', function() {
            assert(checker.checkString('var x = [[ 1 ], [ 2 ]];').isEmpty());
        });

        it('should report anything for empty array', function() {
            assert(checker.checkString('[[]];').isEmpty());
        });
    });

    describe('exceptions', function() {
        it('should not report missing space for parentheses', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['{', '}']
                }
            });

            assert(checker.checkString('var x = [1];').getErrorCount() === 2);
            assert(checker.checkString('var x = [{ a: 1 }];').isEmpty());
        });

        it('should report missing space for the array brackets', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['[', ']']
                }
            });

            assert(checker.checkString('var x = [{}];').getErrorCount() === 2);
            assert(checker.checkString('var x = [[]];').isEmpty());
        });

        it('should not report missing space in both cases', function() {
            checker.configure({
                requireSpacesInsideArrayBrackets: {
                    allExcept: ['(', ')']
                }
            });

            assert(checker.checkString('var x = [{ a: 1 }];').getErrorCount() === 2);
            assert(checker.checkString('var x = [(1)];').isEmpty());
        });
    });
});
