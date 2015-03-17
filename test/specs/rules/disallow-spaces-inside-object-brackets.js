var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw when given an number', function() {
            assert.throws(function() {
                checker.configure({ disallowSpacesInsideObjectBrackets: 2 });
            });
        });
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: true });
        });

        it('should report illegal space after opening brace, with true value', function() {
            assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
        });

        it('should report illegal space before closing brace, with true value', function() {
            assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
        });

        it('should report illegal space in both cases, with true value', function() {
            assert(checker.checkString('var x = { a: 1 };').getErrorCount() === 2);
        });

        it('should report illegal space for nested braces too, with true value', function() {
            assert(checker.checkString('var x = { test: { a: 1 } };').getErrorCount() === 4);
        });

        it('should not report with no spaces, with true value', function() {
            assert(checker.checkString('var x = {a: 1};').isEmpty());
        });
    });

    describe('"all"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: 'all' });
        });

        it('should report illegal space after opening brace, with "all" value', function() {
            assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
        });

        it('should report illegal space before closing brace, with "all" value', function() {
            assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
        });

        it('should report illegal space in both cases, with "all" value', function() {
            assert(checker.checkString('var x = { a: 1 };').getErrorCount() === 2);
        });

        it('should report illegal space for nested braces too, with "all" value', function() {
            assert(checker.checkString('var x = { test: { a: 1 } };').getErrorCount() === 4);
        });

        it('should not report with no spaces, with "all" value', function() {
            assert(checker.checkString('var x = {a: 1};').isEmpty());
        });
    });

    describe('"nested"', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideObjectBrackets: 'nested' });
        });

        it('should report illegal space after opening brace for nested object', function() {
            assert(checker.checkString('var x = {1: { 1 : 2}};').getErrorCount() === 1);
        });

        it('should report illegal space before closing brace for nested object', function() {
            assert(checker.checkString('var x = {1: {1 : 2 }};').getErrorCount() === 1);
        });

        it('should report illegal space in both cases for nested object', function() {
            assert(checker.checkString('var x = {1: { 1 : 2 }};').getErrorCount() === 2);
        });

        it('should report illegal space in both cases for multiple nested object', function() {
            assert(checker.checkString('var x = {1: { 1 : 2 }, 2: { 3 : 4 }};').getErrorCount() === 4);
        });

        it('should not report illegal space in both cases for nested object', function() {
            assert(checker.checkString('var x = {1: {1 : 2}};').isEmpty());
        });
    });

    describe('exceptions', function() {
        it('should act like "true" when allExcept is false', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: false
                }
            });
            assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
        });

        it('should report for function', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: ['}']
                }
            });

            assert(checker.checkString('var x = {a: []};').isEmpty());
            assert(checker.checkString('var x = { a: function() {} };').getErrorCount() === 1);
        });

        it('should report for array literal', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: [']']
                }
            });

            assert(checker.checkString('var x = {a: {b: 2} };').getErrorCount() === 1);
            assert(checker.checkString('var x = {a: [] };').isEmpty());
        });

        it('should report for parentheses', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: [')']
                }
            });

            assert(checker.checkString('var x = {a: {b: 2} };').getErrorCount() === 1);
            assert(checker.checkString('var x = {a: (1) };').isEmpty());
        });

        it('should report for object literal', function() {
            checker.configure({
                disallowSpacesInsideObjectBrackets: {
                    allExcept: ['}']
                }
            });

            assert(checker.checkString('var x = {a: {b: 2} };').isEmpty());
            assert(checker.checkString('var x = { a: { b: 1} };').getErrorCount() === 2);
        });
    });
});
