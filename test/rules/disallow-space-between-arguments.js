var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-between-arguments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBetweenArguments: true });
    });

    it('should report unexpected space for a(b, c)', function() {
        assert.strictEqual(checker.checkString('a(b, c);').getErrorCount(), 1);
    });

    it('should report 2 unexpected spaces for a(b, c, d)', function() {
        assert.strictEqual(checker.checkString('a(b, c, d);').getErrorCount(), 2);
    });

    it('should not report any errors for a(b,c)', function() {
        assert.strictEqual(checker.checkString('a(b,c);').getErrorCount(), 0);
    });

    it('should not report any errors for a(b)', function() {
        assert.strictEqual(checker.checkString('a(b);').getErrorCount(), 0);
    });
});
