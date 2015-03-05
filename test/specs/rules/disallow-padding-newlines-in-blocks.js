var Checker = require('../../../lib/checker');
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
    it('should not report single line empty function definitions', function() {
        assert(checker.checkString('var a = function() {};').isEmpty());
    });
    it('should not report multiline empty function definitions', function() {
        assert(checker.checkString('var a = function() {\n};').isEmpty());
    });
    it('should report extra padding newline followed by comments', function() {
        assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n}').getErrorCount() === 1);
    });
    it('should report extra padding newline preceded by comments', function() {
        assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n\n}').getErrorCount() === 1);
    });
    it('should report extra padding newlines in both cases with comments', function() {
        assert(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n\n}').getErrorCount() === 2);
    });
    it('should not report leading nor trailing comments', function() {
        assert(checker.checkString('if (true) {\n//comment\n\n/* comments */\n}').isEmpty());
    });
    it('should report padding newline even when there is newline after block', function() {
        assert(checker.checkString('if (true) {\n\nvar x = 5;\n}\n\nif (true) {}').getErrorCount() === 1);
    });
});
