var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-padding-newlines-in-blocks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewlinesInBlocks: true });
    });

    it('should not report missing newline after opening brace', function() {
        expect(checker.checkString('if (true) {abc();\n}')).to.have.no.errors();
    });
    it('should not report missing newline before closing brace', function() {
        expect(checker.checkString('if (true) {\nabc();}')).to.have.no.errors();
    });
    it('should report extra padding newline after opening brace', function() {
        expect(checker.checkString('if (true) {\n\nabc();\n}'))
            .to.have.one.error.from('ruleName');
    });
    it('should report extra padding newline before closing brace', function() {
        expect(checker.checkString('if (true) {\nabc();\n\n}'))
            .to.have.one.error.from('ruleName');
    });
    it('should report extra padding newlines in both cases', function() {
        expect(checker.checkString('if (true) {\n\nabc();\n\n}')).to.have.validation.error.count.which.equals(2);
    });
    it('should not report with no spaces', function() {
        expect(checker.checkString('if (true) {\nabc();\n}')).to.have.no.errors();
    });
    it('should not report with no spaces in allman style', function() {
        expect(checker.checkString('if (true)\n{\nabc();\n}')).to.have.no.errors();
    });
    it('should not report with comment on first line', function() {
        expect(checker.checkString('if (true) {\n//comment\nabc();\n}')).to.have.no.errors();
    });
    it('should not report with multi-line comment on first line', function() {
        expect(checker.checkString('if (true) {\n/*\ncomment\n*/\nabc();\n}')).to.have.no.errors();
    });
    it('should not report single line empty function definitions', function() {
        expect(checker.checkString('var a = function() {};')).to.have.no.errors();
    });
    it('should not report multiline empty function definitions', function() {
        expect(checker.checkString('var a = function() {\n};')).to.have.no.errors();
    });
    it('should report extra padding newline followed by comments', function() {
        expect(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n}'))
            .to.have.one.error.from('ruleName');
    });
    it('should report extra padding newline preceded by comments', function() {
        expect(checker.checkString('if (true) {\n//comment\n\n/* comments */\n\n}'))
            .to.have.one.error.from('ruleName');
    });
    it('should report extra padding newlines in both cases with comments', function() {
        expect(checker.checkString('if (true) {\n\n//comment\n\n/* comments */\n\n}')).to.have.validation.error.count.which.equals(2);
    });
    it('should not report leading nor trailing comments', function() {
        expect(checker.checkString('if (true) {\n//comment\n\n/* comments */\n}')).to.have.no.errors();
    });
    it('should report padding newline even when there is newline after block', function() {
        expect(checker.checkString('if (true) {\n\nvar x = 5;\n}\n\nif (true) {}'))
            .to.have.one.error.from('ruleName');
    });
});
