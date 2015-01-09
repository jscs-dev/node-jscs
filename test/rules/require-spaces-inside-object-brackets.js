var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-object-brackets', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('"all"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideObjectBrackets: 'all' });
        });

        it('should report missing space after opening brace', function() {
            assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
        });
        it('should report missing space before closing brace', function() {
            assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
        });
        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
        });
        it('should not report with spaces', function() {
            assert(checker.checkString('var x = { a: 1 };').isEmpty());
        });
        it('should not report for empty object', function() {
            assert(checker.checkString('var x = {};').isEmpty());
        });
        it('should report for nested object', function() {
            assert(checker.checkString('var x = { a: { b: 1 }};').getErrorCount() === 1);
        });
        it('should report anything for empty object', function() {
            assert(checker.checkString('var x = {};').isEmpty());
        });
        it('should report for function value', function() {
            assert(checker.checkString('var x = { a: function() {}};').getErrorCount() === 1);
        });
        it('should report for array literal', function() {
            assert(checker.checkString('var x = { a: []};').getErrorCount() === 1);
        });
        it('should report for parentheses', function() {
            assert(checker.checkString('var x = { a: (1)};').getErrorCount() === 1);
        });
    });

    describe('"allButNested"', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideObjectBrackets: 'allButNested' });
        });

        it('should report missing space after opening brace', function() {
            assert(checker.checkString('var x = {a: 1 };').getErrorCount() === 1);
        });
        it('should report missing space before closing brace', function() {
            assert(checker.checkString('var x = { a: 1};').getErrorCount() === 1);
        });
        it('should report missing space in both cases', function() {
            assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
        });
        it('should not report with spaces', function() {
            assert(checker.checkString('var x = { a: 1 };').isEmpty());
        });
        it('should not report for nested object', function() {
            assert(checker.checkString('var x = { a: { b: 1 }};').isEmpty());
        });
        it('should not report illegal space between closing braces for nested object', function() {
            assert(checker.checkString('var x = { a: { b: 1 } };').isEmpty());
        });
        it('should report not anything for empty object', function() {
            assert(checker.checkString('var x = { a: {}};').isEmpty());
        });
    });

    describe('exceptions', function() {
        describe('"}", "]", ")"', function() {
            beforeEach(function() {
                checker.configure({
                    requireSpacesInsideObjectBrackets: {
                        allExcept: ['}', ']', ')']
                    }
                });
            });

            it('should report missing spaces', function() {
                assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
            });
            it('should not report for function', function() {
                assert(checker.checkString('var x = { a: function() {}};').isEmpty());
            });
            it('should not report for array literal', function() {
                assert(checker.checkString('var x = { a: []};').isEmpty());
            });
            it('should not report for parentheses', function() {
                assert(checker.checkString('var x = { a: (1)};').isEmpty());
            });
            it('should not report for object literal', function() {
                assert(checker.checkString('var x = { a: { b: 1 }};').isEmpty());
            });
        });
    });
});
