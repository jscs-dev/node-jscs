var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw when given an number', function() {
            expect(function() {
                checker.configure({ requireSpacesInsideObjectBrackets: 2 });
            }).to.throw();
        });
    });

    describe.skip('"all"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        });

        it('should report missing space after opening brace', function() {
            expect(checker.checkString('var x = {a: 1 };'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing space before closing brace', function() {
            expect(checker.checkString('var x = { a: 1};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing space in both cases', function() {
            expect(checker.checkString('var x = {a: 1};')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('var x = { a: 1 };')).to.have.no.errors();
        });

        it('should not report for empty object', function() {
            expect(checker.checkString('var x = {};')).to.have.no.errors();
        });

        it('should report for nested object', function() {
            expect(checker.checkString('var x = { a: { b: 1 }};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report anything for empty object', function() {
            expect(checker.checkString('var x = {};')).to.have.no.errors();
        });

        it('should report for function value', function() {
            expect(checker.checkString('var x = { a: function() {}};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report for array literal', function() {
            expect(checker.checkString('var x = { a: []};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report for parentheses', function() {
            expect(checker.checkString('var x = { a: (1)};'))
                .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('"allButNested"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        });

        it('should report missing space after opening brace', function() {
            expect(checker.checkString('var x = {a: 1 };'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing space before closing brace', function() {
            expect(checker.checkString('var x = { a: 1};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing space in both cases', function() {
            expect(checker.checkString('var x = {a: 1};')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('var x = { a: 1 };')).to.have.no.errors();
        });

        it('should not report for nested object', function() {
            expect(checker.checkString('var x = { a: { b: 1 }};')).to.have.no.errors();
        });

        it('should not report illegal space between closing braces for nested object', function() {
            expect(checker.checkString('var x = { a: { b: 1 } };')).to.have.no.errors();
        });

        it('should report not anything for empty object', function() {
            expect(checker.checkString('var x = { a: {}};')).to.have.no.errors();
        });
    });

    describe.skip('exceptions', function() {
        describe.skip('"}", "]", ")"', function() {
            beforeEach(function() {
                checker.configure({
                    requireSpacesInsideObjectBrackets: {
                        allExcept: ['}', ']', ')']
                    }
                });
            });

            it('should report missing spaces', function() {
                expect(checker.checkString('var x = {a: 1};')).to.have.validation.error.count.which.equals(2);
            });
            it('should not report for function', function() {
                expect(checker.checkString('var x = { a: function() {}};')).to.have.no.errors();
            });
            it('should not report for array literal', function() {
                expect(checker.checkString('var x = { a: []};')).to.have.no.errors();
            });
            it('should not report for parentheses', function() {
                expect(checker.checkString('var x = { a: (1)};')).to.have.no.errors();
            });
            it('should not report for object literal', function() {
                expect(checker.checkString('var x = { a: { b: 1 }};')).to.have.no.errors();
            });
        });
    });
});
