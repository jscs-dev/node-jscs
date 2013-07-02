var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterObjectKeys: true });
    });

    it('should report missing space after keys', function() {
        assert(checker.checkString('var x = { a : 1, b: 2 };').getErrorCount() === 1);
        assert(checker.checkString('var x = { abc: 1, b: 2 };').getErrorCount() === 2);
    });

    it('should not report space after keys', function() {
        assert(checker.checkString('var x = { a : 1, bcd : 2 };').isEmpty());
    });
});
