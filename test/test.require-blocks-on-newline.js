var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-blocks-on-newline', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing newline after opening brace', function() {
        checker.configure({ requireBlocksOnNewline: true });
        assert(checker.checkString('if (true) {abc();\n}').getErrorCount() === 1);
    });
    it('should report missing newline before closing brace', function() {
        checker.configure({ requireBlocksOnNewline: true });
        assert(checker.checkString('if (true) {\nabc();}').getErrorCount() === 1);
    });
    it('should report missing newlines in both cases', function() {
        checker.configure({ requireBlocksOnNewline: true });
        assert(checker.checkString('if (true) {abc();}').getErrorCount() === 2);
    });
    it('should not report with no spaces', function() {
        checker.configure({ requireBlocksOnNewline: true });
        assert(checker.checkString('if (true) {\nabc();\n}').isEmpty());
    });
    it('should not report empty function definitions', function() {
        checker.configure({ requireBlocksOnNewline: true });
        assert(checker.checkString('var a = function() {};').isEmpty());
    });
});
