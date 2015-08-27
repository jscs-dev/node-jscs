var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-spaces-inside-brackets', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('true', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideBrackets: true });
        });

        it('should report missing spaces for array accessor', function() {
            expect(checker.checkString('var x = []; x[0]')).to.have.validation.error.count.which.equals(2);
        });

        it('should report missing spaces for array and expression statement (#429)', function() {
            expect(checker.checkString('[ 1 ][0];')).to.have.validation.error.count.which.equals(2);
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
            expect(checker.checkString('var x = [1];')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('var x = [ 1 ];')).to.have.no.errors();
        });

        it('should not report for empty array', function() {
            expect(checker.checkString('var x = [];')).to.have.no.errors();
        });

        it('should report for nested array', function() {
            expect(checker.checkString('var x = [[ 1 ]];')).to.have.validation.error.count.which.equals(2);
        });

        it('should report anything for empty array', function() {
            expect(checker.checkString('[];')).to.have.no.errors();
        });
    });

    describe.skip('exceptions', function() {
        it('should not report missing space for parentheses', function() {
            checker.configure({
                requireSpacesInsideBrackets: {
                    allExcept: ['{', '}']
                }
            });

            expect(checker.checkString('var x = [1];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [{ a: 1 }];')).to.have.no.errors();
        });

        it('should report missing space for the array brackets', function() {
            checker.configure({
                requireSpacesInsideBrackets: {
                    allExcept: ['[', ']']
                }
            });

            expect(checker.checkString('var x = [{}];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [[]];')).to.have.no.errors();
        });

        it('should not report missing space in both cases', function() {
            checker.configure({
                requireSpacesInsideBrackets: {
                    allExcept: ['(', ')']
                }
            });

            expect(checker.checkString('var x = [{ a: 1 }];')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('var x = [(1)];')).to.have.no.errors();
        });
    });
});
