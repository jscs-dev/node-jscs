var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('array value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: ['if', 'for', 'return', 'switch', 'case', 'break', 'throw']
            });
        });

        it('should not report on first expression in a block', function() {
            assert(
                checker.checkString(
                    'function x() { return; }'
                ).isEmpty()
            );
        });

        // Test simple case (including return statement check)
        it('should report on matching return statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a; return; }'
                ).getErrorCount() === 1
            );
        });

        // Test cases for if statements
        it('should report on matching if statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a = true; if (a) { a = !a; }; }'
                ).getErrorCount() === 1
            );
        });

        it('should not report on else if construct', function() {
            assert(
                checker.checkString(
                    'if (true) {} else if (false) {}'
                ).isEmpty()
            );
        });

        it('should not report on keyword following an if without curly braces', function() {
            assert(
                checker.checkString(
                    'function x() { if (true) return; }'
                ).isEmpty()
            );
        });

        // Test case for 'for' statement
        it('should report on matching if statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a = true;' +
                    ' for (var i = 0; i < 10; i++) { a = !a; }; }'
                ).getErrorCount() === 1
            );
        });

        // Test case for 'switch', 'case' and 'break' statement
        it('should report on matching if statement', function() {
            assert(
                checker.checkString(
                    'function x() { var y = true; switch ("Oranges")' + ' { case "Oranges": y = !y; break;' +
                    ' case "Apples": y = !y; break; default: y = !y; } }'
                ).getErrorCount() === 4
            );
        });

        // Test case for 'throw' statement
        it('should report on matching if statement', function() {
            assert(
                checker.checkString(
                    'function x() {try { var a; throw 0; } catch (e) { var b = 0; throw e; } }'
                ).getErrorCount() === 2
            );
        });

        it('should report on multiple matching keywords', function() {
            assert(
                checker.checkString(
                    'function x(a) { var b = 0; if (!a) { return false; };' +
                    ' for (var i = 0; i < b; i++) { if (!a[i]) return false; } return true; }'
                ).getErrorCount() === 3
            );
        });
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: true
            });
        });

        it('should not report on first expression in a block', function() {
            assert(
                checker.checkString(
                    'function x() { return; }'
                ).isEmpty()
            );
        });

        it('should not report in object definitions', function() {
            assert(
                checker.checkString(
                    'var obj = {\n' +
                    '  foo: function x() { return; }\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should not report when parameter inside a function', function() {
            assert(
                checker.checkString(
                    'watchlist.on( "watch", function () {} );'
                ).isEmpty()
            );
        });

        it('should not report when assigned to a variable', function() {
            assert(
                checker.checkString(
                    ' Router.prototype.getPath = function () {};'
                ).isEmpty()
            );
        });

        it('should not report when used inside closure', function() {
            assert(
                checker.checkString(
                    '( function ( $ ) {} )( jQuery );'
                ).isEmpty()
            );
        });

        it('should report on matching return statement', function() {
            assert(
                checker.checkString(
                    'function x() { var a; return; }'
                ).getErrorCount() === 1
            );
        });
    });
});
