var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('if (true) {abc();} //This is a comment'))
              .to.have.one.validation.error.from('requireSpaceAfterLineComment');
        });

        it('should not report comment with space', function() {
            expect(checker.checkString('if (true) {abc();} // This is a good comment')).to.have.no.errors();
        });

        it('should not report block comments', function() {
            expect(checker.checkString('if (true) {abc();} /*A comment*/')).to.have.no.errors();
        });

        it('should not report a line comment with no characters after it', function() {
            expect(checker.checkString('if (true) {abc();} //')).to.have.no.errors();
        });

        it('should report triple slashed comments', function() {
            expect(checker.checkString('if (true) {abc();} /// something'))
              .to.have.one.validation.error.from('requireSpaceAfterLineComment');
        });

        it('should report sharped line comments', function() {
            expect(checker.checkString('if (true) {abc();} //# something'))
              .to.have.one.validation.error.from('requireSpaceAfterLineComment');
        });
    });

    // deprecated. fixes #697
    describe('option value allowSlash', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceAfterLineComment: 'allowSlash' });
        });

        it('should not report microsoft documentation triple slashed comments', function() {
            expect(checker.checkString('function area() {\n  /// <summary>summary</summary>\n  return res;\n}'))
              .to.have.no.errors();
        });

        it('should not report multiline msjsdoc with triple slashed comments', function() {
            expect(checker.checkString('function area() {\n' +
                '  /// <summary>\n' +
                '  ///   summary\n' +
                '  /// </summary>\n' +
                '  return res;\n' +
                '}')).to.have.no.errors();
        });
    });

    describe('exceptions #, --, (xsharp)', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceAfterLineComment: { allExcept: ['#', '--', '(xsharp)'] } });
        });

        it('should not report sharped comment', function() {
            expect(checker.checkString('function area() {\n  //# require something.js\n}')).to.have.no.errors();
        });

        it('should not report (xsharp) line comment', function() {
            expect(checker.checkString('function area() {\n  //(xsharp) special comment\n}')).to.have.no.errors();
        });

        it('should not report line comment with custom substrings', function() {
            expect(checker.checkString('function area() {\n' +
                '  //(xsharp) sourceURL=filename.js\n' +
                '  //-- require something-else.js\n' +
                '  return res;\n' +
                '}')).to.have.no.errors();
        });
    });
});
