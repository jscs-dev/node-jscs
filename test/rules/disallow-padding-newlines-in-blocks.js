var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-in-blocks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewlinesInBlocks: true });
    });

    it('should not report missing newline after opening brace', function() {
        assert(checker.checkString('if (true) {abc();\n}').isEmpty());
    });
    it('should not report missing newline before closing brace', function() {
        assert(checker.checkString('if (true) {\nabc();}').isEmpty());
    });
    it('should report extra padding newline after opening brace', function() {
        assert(checker.checkString('if (true) {\n\nabc();\n}').getErrorCount() === 1);
    });
    it('should report extra padding newline before closing brace', function() {
        assert(checker.checkString('if (true) {\nabc();\n\n}').getErrorCount() === 1);
    });
    it('should report extra padding newlines in both cases', function() {
        assert(checker.checkString('if (true) {\n\nabc();\n\n}').getErrorCount() === 2);
    });
    it('should not report with no spaces', function() {
        assert(checker.checkString('if (true) {\nabc();\n}').isEmpty());
    });
    it('should not report with no spaces in allman style', function() {
        assert(checker.checkString('if (true)\n{\nabc();\n}').isEmpty());
    });
    it('should not report with comment on first line', function() {
        assert(checker.checkString('if (true) {\n//comment\nabc();\n}').isEmpty());
    });
    it('should not report with multi-line comment on first line', function() {
        assert(checker.checkString('if (true) {\n/*\ncomment\n*/\nabc();\n}').isEmpty());
    });
    it('should not report empty function definitions', function() {
        assert(checker.checkString('var a = function() {\n};').isEmpty());
    });
    it('should report extra padding newline after opening brace', function() {
        assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n}').getErrorCount() === 1);
    });
    it('should report extra padding newline before closing brace', function() {
        assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n\n}').getErrorCount() === 1);
    });
    it('should report extra padding newlines in both cases', function() {
        assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n\n}').getErrorCount() === 2);
    });
    it('should count comments as valid tokens', function() {
        assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n}').isEmpty());
    });
    it('should not report errors with comments or code', function() {
        assert(checker.checkString('if (true) {\n//comment\n\n\n/* comments */\n}').isEmpty());
    });
});
