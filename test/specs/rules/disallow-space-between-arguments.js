var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-space-between-arguments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBetweenArguments: true });
    });

    it('should report unexpected space for a(b, c)', function() {
        assert.strictEqual(checker.checkString('a(b, c);').getValidationErrorCount(), 1);
    });

    it('should report 2 unexpected spaces for a(b, c, d)', function() {
        assert.strictEqual(checker.checkString('a(b, c, d);').getValidationErrorCount(), 2);
    });

    it('should not report any errors for a(b,c)', function() {
        assert.strictEqual(checker.checkString('a(b,c);').getValidationErrorCount(), 0);
    });

    it('should not report any errors for a(b)', function() {
        assert.strictEqual(checker.checkString('a(b);').getValidationErrorCount(), 0);
    });

    it('should not report for a(foo(),b)', function() {
        assert.strictEqual(checker.checkString('a(foo(),b);').getValidationErrorCount(), 0);
    });

    it('should not report for a(foo(1,2),b)', function() {
        assert.strictEqual(checker.checkString('a(foo(1,2),b);').getValidationErrorCount(), 0);
    });

    it('should report for a(foo(1, 2), b)', function() {
        assert.strictEqual(checker.checkString('a(foo(1, 2), b);').getValidationErrorCount(), 2);
    });
});
