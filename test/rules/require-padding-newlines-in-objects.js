var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLinesInObjects: true });
    });

    it('should report missing newline after opening brace', function() {
        assert(checker.checkString('var x = {a: 1\n};').getErrorCount() === 1);
        assert(checker.checkString('var x = { a: 1\n};').getErrorCount() === 1);
    });
    it('should report missing newline before closing brace', function() {
        assert(checker.checkString('var x = {\na: 1};').getErrorCount() === 1);
        assert(checker.checkString('var x = {\na: 1 };').getErrorCount() === 1);
    });
    it('should report missing newline in both cases', function() {
        assert(checker.checkString('var x = {a: 1};').getErrorCount() === 2);
        assert(checker.checkString('var x = { a: 1 };').getErrorCount() === 2);
    });
    it('should not report with newlines', function() {
        assert(checker.checkString('var x = {\na: 1\n};').isEmpty());
    });
    it('should not report for empty object', function() {
        assert(checker.checkString('var x = {};').isEmpty());
    });
    it('should report for nested object', function() {
        assert(checker.checkString('var x = {\na: { b: 1 }\n};').getErrorCount() === 2);
    });
});
