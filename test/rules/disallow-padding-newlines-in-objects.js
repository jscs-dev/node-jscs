var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesInObjects: true });
    });

    it('should report existing newline after opening brace', function() {
        assert(checker.checkString('var x = {\na: 1};').getErrorCount() === 1);
    });
    it('should report existing newline before closing brace', function() {
        assert(checker.checkString('var x = {a: 1\n};').getErrorCount() === 1);
    });
    it('should report existing newline in both cases', function() {
        assert(checker.checkString('var x = {\na: 1\n};').getErrorCount() === 2);
    });
    it('should not report with no newlines', function() {
        assert(checker.checkString('var x = {a: 1};').isEmpty());
        assert(checker.checkString('var x = { a: 1 };').isEmpty());
    });
    it('should not report for empty object', function() {
        assert(checker.checkString('var x = {};').isEmpty());
    });
    it('should report for nested object', function() {
        assert(checker.checkString('var x = { a: {\nb: 1\n} };').getErrorCount() === 2);
    });
});
