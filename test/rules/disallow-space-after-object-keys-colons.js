var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeObjectValues: true });
    });

    it('should report with space after keys colons', function() {
        assert.equal(checker.checkString('var x = { a:1, b: 2 };').getErrorCount(), 1, 'one error is found');
        assert.equal(checker.checkString('var x = { abc : 1, b: 2 };').getErrorCount(), 2, 'two errors are found');
    });

    it('should not report with no space after keys colons', function() {
        assert(checker.checkString('var x = { a:1, bcd :2 };').isEmpty());
    });
});
