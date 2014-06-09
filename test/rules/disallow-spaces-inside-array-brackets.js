var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-array-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true value', function() {
        describe('when braces on same line', function() {
            it('should report illegal space after opening brace', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
            });

            it('should report illegal space before closing brace', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
            });

            it('should report illegal space in both cases', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString('var x = [ 1, 2 ];').getErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString('var x = [1, 2];').isEmpty());
            });
        });

        describe('when braces on different lines', function() {
            it('should not report with opening brace on previous line', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString(
                    'var x = [\n' +
                    '   1, 2]'
                ).isEmpty());
            });

            it('should not report with closing brace on new line', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
                assert(checker.checkString(
                    'var x = [1, 2 \n' +
                    '   ]'
                ).isEmpty());
            });

            it('should not report in both cases', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: true });
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
        describe('when braces on same line', function() {
            it('should report illegal space after opening brace', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString('var x = [ 1];').getErrorCount() === 1);
            });

            it('should report illegal space before closing brace', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString('var x = [1 ];').getErrorCount() === 1);
            });

            it('should report illegal space in both cases', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString('var x = [ 1, 2 ];').getErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString('var x = [1, 2];').isEmpty());
            });
        });

        describe('when braces on different lines', function() {
            it('should not report with opening brace on previous line', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString(
                    'var x = [\n' +
                    '   1, 2]'
                ).isEmpty());
            });

            it('should not report with closing brace on new line', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
                assert(checker.checkString(
                    'var x = [1, 2 \n' +
                    '   ]'
                ).isEmpty());
            });

            it('should not report in both cases', function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
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
        it('should report illegal space before closing bracket for nested array', function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
            assert(checker.checkString('var x = [[1 ]];').getErrorCount() === 1);
        });
        it('should report illegal space after opening bracket for nested array', function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
            assert(checker.checkString('var x = [[ 1]];').getErrorCount() === 1);
        });
        it('should report illegal space in both cases for nested array', function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
            assert(checker.checkString('var x = [[ 1 ]];').getErrorCount() === 2);
        });
        it('should not report illegal space in both cases for nested array', function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
            assert(checker.checkString('var x = [ [1] ];').isEmpty());
        });
    });
});
