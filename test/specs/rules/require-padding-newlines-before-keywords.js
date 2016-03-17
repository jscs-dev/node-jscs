var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-padding-newlines-before-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('array value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: [
                    'if', 'for', 'return', 'switch', 'case', 'break', 'throw', 'while', 'default'
                ]
            });
        });

        it('should not report on first expression in a block', function() {
            expect(checker.checkString(
                    'function x() { return; }'
                )).to.have.no.errors();
        });

        // Test simple case (including return statement check)
        it('should report on matching return statement', function() {
            expect(checker.checkString(
                    'function x() { var a; return; }'
                )).to.have.one.validation.error.from('requirePaddingNewlinesBeforeKeywords');
        });

        // Test cases for if statements
        it('should report on matching if statement', function() {
            expect(checker.checkString(
                    'function x() { var a = true; if (a) { a = !a; }; }'
                )).to.have.one.validation.error.from('requirePaddingNewlinesBeforeKeywords');
        });

        it('should not report on else if construct', function() {
            expect(checker.checkString(
                    'if (true) {} else if (false) {}'
                )).to.have.no.errors();
        });

        it('should not report on `do...while` construct', function() {
            expect(checker.checkString(
                    'function x() { var a = true; do { a = !a; } while (a); }'
                )).to.have.no.errors();
        });

        it('should not report on keyword following an if without curly braces', function() {
            expect(checker.checkString(
                    'function x() { if (true) return; }'
                )).to.have.no.errors();
        });

        // Test case for 'for' statement
        it('should report on matching for statement', function() {
            expect(checker.checkString(
                    'function x() { var a = true;' +
                    ' for (var i = 0; i < 10; i++) { a = !a; }; }'
                )).to.have.one.validation.error.from('requirePaddingNewlinesBeforeKeywords');
        });

        // Test case for 'switch', 'case' and 'break' statement
        it('should report on matching switch, case, break, default statements', function() {
            expect(checker.checkString(
                    'function x() { var y = true; switch ("Oranges")' + ' { case "Oranges": y = !y; break;' +
                    ' case "Apples": y = !y; break; default: y = !y; } }'
                )).to.have.error.count.equal(5);
        });

        // Test cases for if statements
        it('should report on matching while statement', function() {
            expect(checker.checkString(
                    'function x() { var a = true; while (!a) { a = !a; }; }'
                )).to.have.one.validation.error.from('requirePaddingNewlinesBeforeKeywords');
        });

        // Test case for 'throw' statement
        it('should report on matching if statement', function() {
            expect(checker.checkString(
                    'function x() {try { var a; throw 0; } catch (e) { var b = 0; throw e; } }'
                )).to.have.error.count.equal(2);
        });

        it('should report on multiple matching keywords', function() {
            expect(checker.checkString(
                    'function x(a) { var b = 0; if (!a) { return false; };' +
                    ' for (var i = 0; i < b; i++) { if (!a[i]) return false; } return true; }'
                )).to.have.error.count.equal(3);
        });
    });

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewlinesBeforeKeywords: true
            });
        });

        it('should not report on first expression in a block', function() {
            expect(checker.checkString(
                'function x() { return; }'
            )).to.have.no.errors();
        });

        it('should not report in object definitions', function() {
            expect(checker.checkString(
                'var obj = {\n' +
                '  foo: function x() { return; }\n' +
                '};'
            )).to.have.no.errors();
        });

        it('should not report when parameter inside a function', function() {
            expect(checker.checkString(
                'watchlist.on( "watch", function () {} );'
            )).to.have.no.errors();
        });

        it('should not report when assigned to a variable', function() {
            expect(checker.checkString(
                ' Router.prototype.getPath = function () {};'
            )).to.have.no.errors();
        });

        it('should not report when used inside closure', function() {
            expect(checker.checkString(
                '( function ( $ ) {} )( jQuery );'
            )).to.have.no.errors();
        });

        it('should report on matching return statement', function() {
            expect(checker.checkString(
                'function x() { var a; return; }'
            )).to.have.one.validation.error.from('requirePaddingNewlinesBeforeKeywords');
        });

        it('should not report when returning a function', function() {
            expect(checker.checkString(
                'function x() {\n' +
                '  var a = 0;\n' +
                '  \n' +
                '  return function() {};\n' +
                '}'
            )).to.have.no.errors();
        });
    });
});
