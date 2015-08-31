var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-inside-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw when given an number', function() {
            expect(function() {
                checker.configure({ disallowSpacesInsideBrackets: 2 });
            }).to.throw();
        });
    });

    describe.skip('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideBrackets: true });
        });

        describe.skip('when braces on same line', function() {
            it('should report missing spaces for array accessor', function() {
                expect(checker.checkString('var x = []; x[ 0 ]')).to.have.validation.error.count.which.equals(2);
            });

            it('should report illegal spaces for array and expression statement (#429)', function() {
                expect(checker.checkString('[1][ 0 ];')).to.have.validation.error.count.which.equals(2);
            });

            it('should report illegal space after opening brace', function() {
                expect(checker.checkString('var x = [ 1];'))
                    .to.have.one.error.from('ruleName');
            });

            it('should report illegal space before closing brace', function() {
                expect(checker.checkString('var x = [1 ];'))
                    .to.have.one.error.from('ruleName');
            });

            it('should report illegal space in both cases', function() {
                expect(checker.checkString('var x = [ 1, 2 ];')).to.have.validation.error.count.which.equals(2);
            });

            it('should not report with no spaces', function() {
                expect(checker.checkString('var x = [1, 2];')).to.have.no.errors();
            });
        });

        describe.skip('when braces on different lines', function() {
            it('should not report with opening brace on previous line', function() {
                expect(
                    checker.checkString(
                    'var x = [\n' +
                    '   1, 2]'
                    )
                ).to.have.no.errors();
            });

            it('should not report with closing brace on new line', function() {
                expect(
                    checker.checkString(
                    'var x = [1, 2 \n' +
                    '   ]'
                    )
                ).to.have.no.errors();
            });

            it('should not report in both cases', function() {
                expect(
                    checker.checkString(
                    'var x = [\n' +
                    '   1,\n' +
                    '   2,\n' +
                    ']'
                    )
                ).to.have.no.errors();
            });
        });
    });

    describe.skip('exceptions', function() {
        it('should act like "true" when allExcept is false', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: false
                }
            });
            expect(checker.checkString('var x = [ 1];'))
                .to.have.one.error.from('ruleName');
        });

        it('should not report missing space for parentheses', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['{', '}']
                }
            });

            expect(checker.checkString('var x = [ 1 ];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [ { a: 1 } ];')).to.have.no.errors();
        });
        it('should report missing space for the array brackets', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['[', ']']
                }
            });

            expect(checker.checkString('var x = [ {} ];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [ [] ];')).to.have.no.errors();
        });
        it('should not report missing space in both cases', function() {
            checker.configure({
                disallowSpacesInsideBrackets: {
                    allExcept: ['(', ')']
                }
            });

            expect(checker.checkString('var x = [ { a: 1 } ];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [ (1) ];')).to.have.no.errors();
        });
    });
});
