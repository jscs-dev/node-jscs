var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw when given an number', function() {
            assert.throws(function() {
                checker.configure({ disallowSpacesInsideBrackets: 2 });
            });
        });
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideBrackets: true });
        });

        describe('when braces on same line', function() {
            it('should report missing spaces for array accessor', function() {
                assert(checker.checkString('var x = []; x[ 0 ]').getErrorCount() === 2);
            });

            it('should report illegal spaces for array and expression statement (#429)', function() {
                assert(checker.checkString('[1][ 0 ];').getErrorCount() === 2);
            });

            it('should report illegal space after opening brace', function() {
                assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
            });

            it('should report illegal space before closing brace', function() {
                assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
            });

            it('should report illegal space in both cases', function() {
                assert(checker.checkString('var x = [ 1, 2 ];').getErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                assert(checker.checkString('var x = [1, 2];').isEmpty());
            });
        });

        describe('when braces on different lines', function() {
            it('should not report with opening brace on previous line', function() {
                assert(checker.checkString(
                    'var x = [\n' +
                    '   1, 2]'
                ).isEmpty());
            });

            it('should not report with closing brace on new line', function() {
                assert(checker.checkString(
                    'var x = [1, 2 \n' +
                    '   ]'
                ).isEmpty());
            });

            it('should not report in both cases', function() {
                assert(checker.checkString(
                    'var x = [\n' +
                    '   1,\n' +
                    '   2,\n' +
                    ']'
                ).isEmpty());
            });
        });
    });

    describe('exceptions', function() {
        it('should act like "true" when allExcept is false', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: false
                }
            });
            assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
        });

        it('should not report missing space for parentheses', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['{', '}']
                }
            });

            assert(checker.checkString('var x = [ 1 ];').getErrorCount() === 2);
            assert(checker.checkString('var x = [ { a: 1 } ];').isEmpty());
        });
        it('should report missing space for the array brackets', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['[', ']']
                }
            });

            assert(checker.checkString('var x = [ {} ];').getErrorCount() === 2);
            assert(checker.checkString('var x = [ [] ];').isEmpty());
        });
        it('should not report missing space in both cases', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['(', ')']
                }
            });

            assert(checker.checkString('var x = [ { a: 1 } ];').getErrorCount() === 2);
            assert(checker.checkString('var x = [ (1) ];').isEmpty());
        });
    });
});
