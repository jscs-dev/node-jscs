var expect = require('chai').expect;
var Checker = require('../../../lib/checker');

describe('rules/require-early-return', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with option value noElse - ', function() {
        beforeEach(function() {
            checker.configure({ requireEarlyReturn: 'noElse' });
        });

        var str;

        // Should be errors

        describe('simple if-else - ', function() {
            it('should report the use of else after return', function() {
                str = 'function foo() { if (x) { return y; } else { return z; } }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });

            it('should report the use of else after return with small blocks', function() {
                str = 'function foo() { if (x) { var a; return y; } else { return z; } }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });

            it('should report the use of else after return without braces', function() {
                str = 'function foo() { if (x) return y; else return z; }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });
        });

        describe('complex if-else - ', function() {
            it('should report the use of else after return in a chain of if-else', function() {
                str = 'function foo() { if (x) { return y; } else if (z) { return w; } else { return t; } }';
                expect(checker.checkString(str)).to.have.errors.from('requireEarlyReturn');
            });

            it('should report the use of else after return in an if-else', function() {
                str = 'function foo() { if (x) { return y; } else { var t = "foo"; } return t; }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });

            it('should report the use of else after return in a nested chain of if-else', function() {
                str = 'function foo() { if (x) { if (y) { return y; } else { return x; } } else { return z; } }';
                expect(checker.checkString(str)).to.have.errors.from('requireEarlyReturn');
            });

            it('should report the use of else after return in a nested chain of if-else without braces', function() {
                str = 'function foo() { if (x) if (y) return; else var b }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });
        });

        // Should pass

        describe('safe if-else - ', function() {
            it('should not report the use of else after return', function() {
                str = 'function foo() { if (x) { return y; } return z; }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with blocks', function() {
                str = 'function foo() { if (x) { foo(); } else if (z) { var t = "foo"; } else { return w; } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with nested if', function() {
                str = 'function foo() { if (x) { if (z) { return y; } } else { return z; } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });
        });

        // One should fail, one should pass

        describe('check isPercentage function - ', function() {
            it('should report errors', function() {
                str = 'function isPercentage(val) {' +
                    'if (val >= 0) { if (val < 100) { return true; } else { return false; } } else { return false; }' +
                    '}';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });
            it('should not report errors', function() {
                str = 'function isPercentage(val) {' +
                    'if (val >= 0) { if (val < 100) { return true; } return false; } return false;' +
                    '}';
                expect(checker.checkString(str)).to.have.no.errors();
            });
        });
    });
});
