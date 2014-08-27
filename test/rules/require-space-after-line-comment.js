var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-line-comment', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceAfterLineComment: true });
        });

        it('should report missing space after line comment', function() {
            assert(checker.checkString('if (true) {abc();} //This is a comment').getErrorCount() === 1);
        });
        it('should not report comment with space', function() {
            assert(checker.checkString('if (true) {abc();} // This is a good comment').isEmpty());
        });
        it('should not report block comments', function() {
            assert(checker.checkString('if (true) {abc();} /*A comment*/').isEmpty());
        });
        it('should not report a line comment with no characters after it', function() {
            assert(checker.checkString('if (true) {abc();} //').isEmpty());
        });

        it('should not report microsoft documentation triple slashed comments', function() {
            assert(checker.checkString('function area() {\n  /// <summary>summary</summary>\n  return res;\n}')
                .isEmpty());
        });
        it('should report triple slashed comments', function() {
            assert(checker.checkString('if (true) {abc();} /// something').getErrorCount() === 1);
        });
    });
});
