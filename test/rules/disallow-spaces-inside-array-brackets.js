var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-array-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: true });
        });

        describe('when braces on same line', function() {
            it.skip('should report illegal spaces for array and expression statement (#429)', function() {
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

    describe('"all"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
        });

        describe('when braces on same line', function() {
            it('should treat expression illegal space after opening brace', function() {
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
            it('should report illegal space in both cases', function() {
                assert(checker.checkString('[ 1, 2 ];').getErrorCount() === 2);
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

    describe('"nested"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
        });

        it.skip('should report illegal spaces for array and expression statement (#429)', function() {
            assert(checker.checkString('[ [1][ 0 ] ];').getErrorCount() === 2);
        });
        it('should not report for not nested array', function() {
            assert(checker.checkString('var x = [ 1 ];').isEmpty());
        });
        it('should report illegal space before closing bracket for nested array', function() {
            assert(checker.checkString('var x = [[1 ]];').getErrorCount() === 1);
        });
        it('should report illegal space after opening bracket for nested array', function() {
            assert(checker.checkString('var x = [[ 1]];').getErrorCount() === 1);
        });
        it('should report illegal space in both cases for nested array', function() {
            assert(checker.checkString('var x = [[ 1 ]];').getErrorCount() === 2);
        });
        it('should not report illegal space in both cases for nested array', function() {
            assert(checker.checkString('var x = [ [1] ];').isEmpty());
        });
        it('should report correct line with comma use-case', function() {
            var check = checker.checkString('[ [1 ], [2] ];');
            var column = check.getErrorList()[0].column;

            assert(check.getErrorCount() === 1);
            assert(column === 4);
        });
    });
});
