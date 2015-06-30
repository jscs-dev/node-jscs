var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-inside-array-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw when given an number', function() {
            assert.throws(function() {
                checker.configure({ disallowSpacesInsideArrayBrackets: 2 });
            });
        });
    });

    describe.skip('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: true });
        });

        describe.skip('when braces on same line', function() {
            it('should report illegal space after opening brace', function() {
                expect(checker.checkString('var x = [ 1];'))
            .to.have.one.error.from('ruleName');
            });

            it('should report illegal space before closing brace', function() {
                expect(checker.checkString('var x = [1 ];'))
            .to.have.one.error.from('ruleName');
            });

            it('should report illegal space in both cases', function() {
                assert(checker.checkString('var x = [ 1, 2 ];').getValidationErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                expect(checker.checkString('var x = [1, 2];')).to.have.no.errors();
            });
        });

        describe.skip('when braces on different lines', function() {
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

        it('should not report with comments before the first element', function() {
            assert(checker.checkString(
                'var x = [/*A*/ 1, 2]'
            ).isEmpty());
        });

        it('should not report with comments after the last element', function() {
            assert(checker.checkString(
                'var x = [1, 2, /*Z*/]'
            ).isEmpty());
        });
    });

    describe.skip('"all"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'all' });
        });

        describe.skip('when braces on same line', function() {
            it('should treat expression illegal space after opening brace', function() {
                expect(checker.checkString('var x = [ 1];'))
            .to.have.one.error.from('ruleName');
            });

            it('should report illegal space before closing brace', function() {
                expect(checker.checkString('var x = [1 ];'))
            .to.have.one.error.from('ruleName');
            });

            it('should report illegal space in both cases', function() {
                assert(checker.checkString('var x = [ 1, 2 ];').getValidationErrorCount() === 2);
            });

            it('should not report with no spaces', function() {
                expect(checker.checkString('var x = [1, 2];')).to.have.no.errors();
            });

            it('should report illegal space in both cases', function() {
                assert(checker.checkString('[ 1, 2 ];').getValidationErrorCount() === 2);
            });
        });

        describe.skip('when braces on different lines', function() {
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

    describe.skip('"nested"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideArrayBrackets: 'nested' });
        });

        it('should report illegal space before closing bracket for nested array', function() {
            expect(checker.checkString('var x = [[1 ]];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report illegal space after opening bracket for nested array', function() {
            expect(checker.checkString('var x = [[ 1]];'))
            .to.have.one.error.from('ruleName');
        });

        it('should report illegal space in both cases for nested array', function() {
            assert(checker.checkString('var x = [[ 1 ]];').getValidationErrorCount() === 2);
        });

        it('should not report illegal space in both cases for nested array', function() {
            expect(checker.checkString('var x = [ [1] ];')).to.have.no.errors();
        });

        it('should report correct line with comma use-case', function() {
            var check = checker.checkString('[ [1 ], [2] ];');
            var column = check.getErrorList()[0].column;

            expect(check)
            .to.have.one.error.from('ruleName');
            assert(column === 4);
        });
    });

    describe.skip('exceptions', function() {
        it('should act like "true" when allExcept is false', function() {
            checker.configure({
                disallowSpacesInsideArrayBrackets: {
                    allExcept: false
                }
            });
            expect(checker.checkString('var x = [ 1];'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report missing space for parentheses', function() {
            checker.configure({
                disallowSpacesInsideArrayBrackets: {
                    allExcept: ['{', '}']
                }
            });

            assert(checker.checkString('var x = [ 1 ];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [ { a: 1 } ];')).to.have.no.errors();
        });

        it('should report missing space for the array brackets', function() {
            checker.configure({
                disallowSpacesInsideArrayBrackets: {
                    allExcept: ['[', ']']
                }
            });

            assert(checker.checkString('var x = [ {} ];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [ [] ];')).to.have.no.errors();
        });

        it('should not report missing space in both cases', function() {
            checker.configure({
                disallowSpacesInsideArrayBrackets: {
                    allExcept: ['(', ')']
                }
            });

            assert(checker.checkString('var x = [ { a: 1 } ];').getValidationErrorCount() === 2);
            expect(checker.checkString('var x = [ (1) ];')).to.have.no.errors();
        });
    });
});
