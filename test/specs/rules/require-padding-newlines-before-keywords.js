var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-padding-newlines-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('array value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: ['if', 'for', 'return', 'switch', 'case', 'break', 'throw']
            });
        });

        it('should not report on first expression in a block', function() {
            expect(
                checker.checkString(
                    'function x() { if (true) return; }'
                )
            ).to.have.no.errors();
        });

        // Test simple case (including return statement check)
        it('should report on matching return statement', function() {
            expect(
                checker.checkString(
                    'function x() { var a; return; }'
                )
            ).to.have.one.validation.error();
        });

        // Test cases for if statements
        it('should report on matching if statement', function() {
            expect(
                checker.checkString(
                    'function x() { var a = true; if (a) { a = !a; }; }'
                )
            ).to.have.one.validation.error();
        });

        it('should not report on else if construct', function() {
            expect(
                checker.checkString(
                    'function x() { if (true) return; }'
                )
            ).to.have.no.errors();
        });

        it('should not report on keyword following an if without curly braces', function() {
            expect(
                checker.checkString(
                    'function x() { if (true) return; }'
                )
            ).to.have.no.errors();
        });

        // Test case for 'for' statement
        it('should report on matching if statement', function() {
            expect(
                checker.checkString(
                    'function x() { var a = true;' +
                    ' for (var i = 0; i < 10; i++) { a = !a; }; }'
                )
            ).to.have.one.validation.error();
        });

        // Test case for 'switch', 'case' and 'break' statement
        it('should report on matching if statement', function() {
            expect(
                checker.checkString(
                    'function x() { var y = true; switch ("Oranges")' + ' { case "Oranges": y = !y; break;' +
                    ' case "Apples": y = !y; break; default: y = !y; } }'
                )
            ).to.have.validation.error.count.which.equals(4);
        });

        // Test case for 'throw' statement
        it('should report on matching if statement', function() {
            expect(
                checker.checkString(
                    'function x() {try { var a; throw 0; } catch (e) { var b = 0; throw e; } }'
                )
            ).to.have.validation.error.count.which.equals(2);
        });

        it('should report on multiple matching keywords', function() {
            expect(
                checker.checkString(
                    'function x(a) { var b = 0; if (!a) { return false; };' +
                    ' for (var i = 0; i < b; i++) { if (!a[i]) return false; } return true; }'
                )
            ).to.have.validation.error.count.which.equals(3);
        });
    });

    describe.skip('true value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: true
            });
        });

        it('should not report on first expression in a block', function() {
            expect(
                checker.checkString(
                    'function x() { return; }'
                )
            ).to.have.no.errors();
        });

        it('should not report in object definitions', function() {
            expect(
                checker.checkString(
                    'var obj = {\n' +
                    '  foo: function x() { return; }\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should not report when parameter inside a function', function() {
            expect(
                checker.checkString(
                    'watchlist.on( "watch", function () {} );'
                )
            ).to.have.no.errors();
        });

        it('should not report when assigned to a variable', function() {
            expect(
                checker.checkString(
                    ' Router.prototype.getPath = function () {};'
                )
            ).to.have.no.errors();
        });

        it('should not report when used inside closure', function() {
            expect(
                checker.checkString(
                    '( function ( $ ) {} )( jQuery );'
                )
            ).to.have.no.errors();
        });

        it('should report on matching return statement', function() {
            expect(
                checker.checkString(
                    'function x() { var a; return; }'
                )
            ).to.have.one.validation.error();
        });
    });
});
