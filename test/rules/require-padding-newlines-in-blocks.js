var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-in-blocks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: true });
        });

        it('should report missing padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();\n\n}').getErrorCount() === 1);
        });
        it('should report missing padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {\nabc();\n\n}').getErrorCount() === 1);
        });
        it('should report missing padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();}').getErrorCount() === 1);
        });
        it('should report missing padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n}').getErrorCount() === 1);
        });
        it('should report missing padding newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();}').getErrorCount() === 2);
        });
        it('should report missing padding newlines in both cases', function() {
            assert(checker.checkString('if (true) {\nabc();\n}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\n\nabc();\n\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
        it('should not report missing newlines after opening brace', function() {
            assert(checker.checkString('if (true) {\n\n\nabc();\n\n}').isEmpty());
        });
        it('should not report missing newlines before closing brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();\nabc();\n\n\n}').isEmpty());
        });
        it('should not report missing newlines with comments inside block', function() {
            assert(checker.checkString('if (true) {\n\n//bla\nabc();\nabc();\n\n}').isEmpty());
        });
    });

    describe('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: 1 });
        });

        it('should report missing padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();abc();\n\n}').getErrorCount() === 1);
        });
        it('should report missing padding newline after opening brace', function() {
            assert(checker.checkString('if (true) {\nabc();abc();\n\n}').getErrorCount() === 1);
        });
        it('should report missing padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();abc();}').getErrorCount() === 1);
        });
        it('should report missing padding newline before closing brace', function() {
            assert(checker.checkString('if (true) {\n\nabc();abc();\n}').getErrorCount() === 1);
        });
        it('should report missing padding newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();abc();}').getErrorCount() === 2);
        });
        it('should report missing padding newlines in both cases', function() {
            assert(checker.checkString('if (true) {\nabc();abc();\n}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\n\nabc();abc();\n\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
        it('should not report single statement functions', function() {
            assert(checker.checkString('var a = function() {abc();};').isEmpty());
        });
    });
});
