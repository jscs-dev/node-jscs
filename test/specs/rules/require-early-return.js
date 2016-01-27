var expect = require('chai').expect;
var Checker = require('../../../lib/checker');

describe('rules/require-early-return', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with option value `true` - ', function() {
        beforeEach(function() {
            checker.configure({ requireEarlyReturn: true });
        });

        var str;

        describe('errors with simple if-else - ', function() {
            it('should report the use of else after return on an if-else block', function() {
                str = 'function foo() { if (true) { return } else { } }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });

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

            it('should report the use of else after return when the if block contain a return', function() {
                str = 'function test() { if (true) { return; eval() } else {} }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });
        });

        describe('errors with complex if-else - ', function() {
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

            it('should report the use of else after return in a nested chain of if-else mixed', function() {
                str = 'function foo() { if (x) { } else { if (y) return; else var b } }';
                expect(checker.checkString(str)).to.have.one.validation.error.from('requireEarlyReturn');
            });
        });

        describe('safe if-else - ', function() {
            it('should not report on an empty if', function() {
                str = 'function test() { if (true) { } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return', function() {
                str = 'function foo() { if (x) { return y; } return z; }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with blocks 1', function() {
                str = 'function foo() { if (x) { foo(); } else if (z) { var t = "foo"; } else { return w; } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with blocks 2', function() {
                str = 'function foo() { if (x) { bar(); } else if (z) { return "foo"; } else { baz(); } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with blocks without braces', function() {
                str = 'function foo() { if (x) bar(); else if (z) return "foo"; else baz(); }';
                expect(checker.checkString(str)).to.have.no.errors();
            });

            it('should not report the use of else after return with nested if', function() {
                str = 'function foo() { if (x) { if (z) { return y; } } else { return z; } }';
                expect(checker.checkString(str)).to.have.no.errors();
            });
        });
    });
});
