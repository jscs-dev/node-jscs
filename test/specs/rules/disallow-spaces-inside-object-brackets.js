var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw when given an number', function() {
            expect(function() {
                checker.configure({ disallowSpacesInsideObjectBrackets: 2 });
            }).to.throw();
        });
    });

    describe.skip('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: true });
        });

        it('should report illegal space after opening brace, with true value', function() {
            expect(checker.checkString('var x = { a: 1};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report illegal space before closing brace, with true value', function() {
            expect(checker.checkString('var x = {a: 1 };'))
                .to.have.one.error.from('ruleName');
        });

        it('should report illegal space in both cases, with true value', function() {
            expect(checker.checkString('var x = { a: 1 };')).to.have.validation.error.count.which.equals(2);
        });

        it('should report illegal space for nested braces too, with true value', function() {
            expect(checker.checkString('var x = { test: { a: 1 } };')).to.have.validation.error.count.which.equals(4);
        });

        it('should not report with no spaces, with true value', function() {
            expect(checker.checkString('var x = {a: 1};')).to.have.no.errors();
        });
    });

    describe.skip('"all"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: 'all' });
        });

        it('should report illegal space after opening brace, with "all" value', function() {
            expect(checker.checkString('var x = { a: 1};'))
                .to.have.one.error.from('ruleName');
        });

        it('should report illegal space before closing brace, with "all" value', function() {
            expect(checker.checkString('var x = {a: 1 };'))
            .to.have.one.error.from('ruleName');
        });

        it('should report illegal space in both cases, with "all" value', function() {
            expect(checker.checkString('var x = { a: 1 };')).to.have.validation.error.count.which.equals(2);
        });

        it('should report illegal space for nested braces too, with "all" value', function() {
            expect(checker.checkString('var x = { test: { a: 1 } };')).to.have.validation.error.count.which.equals(4);
        });

        it('should not report with no spaces, with "all" value', function() {
            expect(checker.checkString('var x = {a: 1};')).to.have.no.errors();
        });
    });

    describe.skip('"nested"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: 'nested' });
        });

        it('should report illegal space after opening brace for nested object', function() {
            expect(checker.checkString('var x = {1: { 1 : 2}};'))
            .to.have.one.error.from('ruleName');
        });

        it('should report illegal space before closing brace for nested object', function() {
            expect(checker.checkString('var x = {1: {1 : 2 }};'))
            .to.have.one.error.from('ruleName');
        });

        it('should report illegal space in both cases for nested object', function() {
            expect(checker.checkString('var x = {1: { 1 : 2 }};')).to.have.validation.error.count.which.equals(2);
        });

        it('should report illegal space in both cases for multiple nested object', function() {
            expect(checker.checkString('var x = {1: { 1 : 2 }, 2: { 3 : 4 }};')).to.have.validation.error.count.which.equals(4);
        });

        it('should not report illegal space in both cases for nested object', function() {
            expect(checker.checkString('var x = {1: {1 : 2}};')).to.have.no.errors();
        });
    });

    describe.skip('exceptions', function() {
        it('should act like "true" when allExcept is false', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: false
                }
            });
            expect(checker.checkString('var x = { a: 1};'))
            .to.have.one.error.from('ruleName');
        });

        it('should report for function', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: ['}']
                }
            });

            expect(checker.checkString('var x = {a: []};')).to.have.no.errors();
            expect(checker.checkString('var x = { a: function() {} };'))
            .to.have.one.error.from('ruleName');
        });

        it('should report for array literal', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: [']']
                }
            });

            expect(checker.checkString('var x = {a: {b: 2} };'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = {a: [] };')).to.have.no.errors();
        });

        it('should report for parentheses', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: [')']
                }
            });

            expect(checker.checkString('var x = {a: {b: 2} };'))
            .to.have.one.error.from('ruleName');
            expect(checker.checkString('var x = {a: (1) };')).to.have.no.errors();
        });

        it('should report for object literal', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: ['}']
                }
            });

            expect(checker.checkString('var x = {a: {b: 2} };')).to.have.no.errors();
            expect(checker.checkString('var x = { a: { b: 1} };')).to.have.validation.error.count.which.equals(2);
        });
    });
});
