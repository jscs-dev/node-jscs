var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeObjectValues: true });
    });

    it('should report with no space after keys colons', function() {
        assert.equal(checker.checkString('var x = { a:1, b: 2 };').getErrorCount(), 1, 'one error is found');
        assert.equal(checker.checkString('var x = { abc :1, b:2 };').getErrorCount(), 2, 'two errors are found');
    });

    it('should not report with parenthesised property value', function() {
        assert(checker.checkString('var data = { key: (x > 2) };').isEmpty());
        assert(checker.checkString('var video = { isFullHD: ((width > 1920) && (height > 1080)) };').isEmpty());
        assert(checker.checkString('var data = { key:    (    (   ( ( 2 ))))};').isEmpty());
    });

    it('should not report with array initializer as property value', function() {
        assert(checker.checkString('var jsFiles = { src: ["*.js"] }').isEmpty());
    });

    it('should not report with nested objects', function() {
        assert(checker.checkString('var foo = { bar: { baz: 127 } };').isEmpty());
    });

    it('should not report with end of line after keys colons', function() {
        assert(checker.checkString(
            'var x = {\n' +
            '   a:\n' +
            '   2\n' +
            '}'
        ).isEmpty());
    });

    it('should not report with space after keys colons', function() {
        assert(checker.checkString('var x = { a: 1, bcd: 2 };').isEmpty());
    });
});
