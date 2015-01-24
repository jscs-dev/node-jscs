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

        it('should report triple slashed comments', function() {
            assert(checker.checkString('if (true) {abc();} /// something').getErrorCount() === 1);
        });

        it('should report sharped line comments', function() {
            assert(checker.checkString('if (true) {abc();} //# something').getErrorCount() === 1);
        });
    });

    // deprecated. fixes #697
    describe('option value allowSlash', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceAfterLineComment: 'allowSlash' });
        });

        it('should not report microsoft documentation triple slashed comments', function() {
            assert(checker.checkString('function area() {\n  /// <summary>summary</summary>\n  return res;\n}')
                .isEmpty());
        });

        it('should not report multiline msjsdoc with triple slashed comments', function() {
            assert(checker.checkString('function area() {\n' +
                '  /// <summary>\n' +
                '  ///   summary\n' +
                '  /// </summary>\n' +
                '  return res;\n' +
                '}')
                .isEmpty());
        });
    });

    describe('exceptions #, --, (xsharp)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceAfterLineComment: { allExcept: ['#', '--', '(xsharp)'] } });
        });

        it('should not report sharped comment', function() {
            assert(checker.checkString('function area() {\n  //# require something.js\n}')
                .isEmpty());
        });

        it('should not report (xsharp) line comment', function() {
            assert(checker.checkString('function area() {\n  //(xsharp) special comment\n}')
                .isEmpty());
        });

        it('should not report line comment with custom substrings', function() {
            assert(checker.checkString('function area() {\n' +
                '  //(xsharp) sourceURL=filename.js\n' +
                '  //-- require something-else.js\n' +
                '  return res;\n' +
                '}')
                .isEmpty());
        });
    });
});
