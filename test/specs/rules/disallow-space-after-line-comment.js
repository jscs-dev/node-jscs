var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('if (true) {abc();} // This is a comment'))
              .to.have.one.validation.error.from('disallowSpaceAfterLineComment');
        });
        it('should not report comment without space', function() {
            expect(checker.checkString('if (true) {abc();} //This is a good comment')).to.have.no.errors();
        });
        it('should not report block comments with a space', function() {
            expect(checker.checkString('if (true) {abc();} /* A comment*/')).to.have.no.errors();
        });
        it('should not report block comments without a space', function() {
            expect(checker.checkString('if (true) {abc();} /*A comment*/')).to.have.no.errors();
        });
        it('should not report a line comment with no characters after it', function() {
            expect(checker.checkString('if (true) {abc();} //')).to.have.no.errors();
        });
    });
});
