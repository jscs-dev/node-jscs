var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-blocks-on-newline', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: true });
        });

        it('should report missing newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();\n}').getErrorCount() === 1);
        });
        it('should report missing newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();}').getErrorCount() === 1);
        });
        it('should report missing newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\nabc();\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
    });

    describe('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: 1 });
        });

        it('should report missing newline after opening brace', function() {
            assert(checker.checkString('if (true) {abc();abc();\n}').getErrorCount() === 1);
        });
        it('should report missing newline before closing brace', function() {
            assert(checker.checkString('if (true) {\nabc();abc();}').getErrorCount() === 1);
        });
        it('should report missing newlines in both cases', function() {
            assert(checker.checkString('if (true) {abc();abc();}').getErrorCount() === 2);
        });
        it('should not report with no spaces', function() {
            assert(checker.checkString('if (true) {\nabc();abc();\n}').isEmpty());
        });
        it('should not report empty function definitions', function() {
            assert(checker.checkString('var a = function() {};').isEmpty());
        });
        it('should not report single statement functions', function() {
            assert(checker.checkString('var a = function() {abc();};').isEmpty());
        });
    });
});
