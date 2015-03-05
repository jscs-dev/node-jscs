var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-line-comment', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterLineComment: true });
        });

        it('should report space after line comment', function() {
            assert(checker.checkString('if (true) {abc();} // This is a comment').getErrorCount() === 1);
        });
        it('should not report comment without space', function() {
            assert(checker.checkString('if (true) {abc();} //This is a good comment').isEmpty());
        });
        it('should not report block comments with a space', function() {
            assert(checker.checkString('if (true) {abc();} /* A comment*/').isEmpty());
        });
        it('should not report block comments without a space', function() {
            assert(checker.checkString('if (true) {abc();} /*A comment*/').isEmpty());
        });
        it('should not report a line comment with no characters after it', function() {
            assert(checker.checkString('if (true) {abc();} //').isEmpty());
        });
    });
});
