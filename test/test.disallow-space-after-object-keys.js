var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceAfterObjectKeys: true });
    });

    it('should report with space(s) after keys', function() {
        assert(checker.checkString('var x = { a : 1, b: 2 };').getErrorCount() === 1);
        assert(checker.checkString('var x = { abc : 1, b  : 2 };').getErrorCount() === 2);
    });

    it('should report with end of line after keys', function() {
        assert(checker.checkString(
            'var x = {' +
            '   a\n' +
            '   :\n' +
            '   2\n' +
            '}'
        ).getErrorCount() === 1);
    });

    it('should not report without space after keys', function() {
        assert(checker.checkString('var x = { a: 1, bcd: 2 };').isEmpty());
    });
});
