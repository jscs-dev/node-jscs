var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-between-arguments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBetweenArguments: true });
    });

    it('should report expected space for a(b,c)', function() {
        assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 1);
    });

    it('should report 2 expected spaces for a(b,c,d)', function() {
        assert.strictEqual(checker.checkString('a(b,c,d);').getErrorCount(), 2);
    });

    it('should not report any errors for a(b, c)', function() {
        assert(checker.checkString('a(b, c);').isEmpty());
    });

    it('should not report any errors for a(b,  c)', function() {
        assert(checker.checkString('a(b,  c);').isEmpty());
    });

    it('should not report any errors for a(b)', function() {
        assert(checker.checkString('a(b);').isEmpty());
    });

    it('should report for a(foo(),b)', function() {
        assert.strictEqual(checker.checkString('a(foo(),b);').getErrorCount(), 1);
    });

    it('should report for a(foo(1,2),b)', function() {
        assert.strictEqual(checker.checkString('a(foo(1,2),b);').getErrorCount(), 2);
    });

    it('should not report for a(foo(1, 2), b)', function() {
        assert(checker.checkString('a(foo(1, 2), b);').isEmpty());
    });
});
