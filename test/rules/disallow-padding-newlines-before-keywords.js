var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('array value', function() {
        beforeEach(function() {
            checker.configure({
                disallowPaddingNewlinesBeforeKeywords: ['if', 'for', 'return', 'switch', 'case', 'break', 'throw']
            });
        });

        // Test simple case (including return statement check)
        it('should report on matching return statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a;\n\nreturn; }'
                ).getErrorCount() === 1
            );
        });

        // Test cases for if statements
        it('should report on matching if statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a = true;\n\nif (a) { a = !a; }; }'
                ).getErrorCount() === 1
            );
        });

        // Test case for 'for' statement
        it('should report on matching for statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a = true;\n\nfor (var i = 0; i < 10; i++) { a = !a; }; }'
                ).getErrorCount() === 1
            );
        });

        // Test case for 'switch', 'case' and 'break' statement
        it('should report on matching switch, case and break statements', function() {
            assert(
                checker.checkString(
                    'function x() { var y = true;\n\nswitch ("Oranges") { case "Oranges": ' +
                    'y = !y;\n\nbreak;\n\ncase "Apples": y = !y;\n\nbreak; default: y = !y; } }'
                ).getErrorCount() === 4
            );
        });

        // Test case for 'throw' statement
        it('should report on matching throw statement', function() {
            assert(
                checker.checkString(
                    'function x() {try { var a;\n\nthrow 0; } ' +
                    'catch (e) { var b = 0;\n\nthrow e; } }'
                ).getErrorCount() === 2
            );
        });

        it('should report on multiple matching keywords', function() {
            assert(
                checker.checkString(
                    'function x(a) { var b = 0;\n\nif (!a) { return false; };\n\n' +
                    'for (var i = 0; i < b; i++) { if (!a[i]) return false; }\n\nreturn true; }'
                ).getErrorCount() === 3
            );
        });
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({
                disallowPaddingNewlinesBeforeKeywords: true
            });
        });

        it('should report on matching return statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a;\n\nreturn; }'
                ).getErrorCount() === 1
            );
        });
    });
});
