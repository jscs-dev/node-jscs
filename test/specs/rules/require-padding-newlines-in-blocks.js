var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-padding-newlines-in-blocks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: true });
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {\nabc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();}')).to.have.validation.error.count.which.equals(2);
        });

        it('should report missing padding newlines in both cases', function() {
            expect(checker.checkString('if (true) {\nabc();\n}')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n\n}')).to.have.no.errors();
        });

        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });

        it('should not report missing newlines after opening brace', function() {
            expect(checker.checkString('if (true) {\n\n\nabc();\n\n}')).to.have.no.errors();
        });

        it('should not report missing newlines before closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();\nabc();\n\n\n}')).to.have.no.errors();
        });

        it('should not report missing newlines with comments inside block', function() {
            expect(checker.checkString('if (true) {\n\n//bla\nabc();\nabc();\n\n}')).to.have.no.errors();
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {//bla\n\nabc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {\n/**/\nabc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline between oneline comment and closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();\n\n//\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should fix missing padding newlines', function() {
            expect(checker.fixString('if (true) {abc();abc();}').output)
                .to.equal('if (true) {\n\nabc();abc();\n\n}');
        });
    });

    describe.skip('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewlinesInBlocks: 1 });
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();abc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline after opening brace', function() {
            expect(checker.checkString('if (true) {\nabc();abc();\n\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();abc();}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newline before closing brace', function() {
            expect(checker.checkString('if (true) {\n\nabc();abc();\n}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing padding newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();abc();}')).to.have.validation.error.count.which.equals(2);
        });

        it('should report missing padding newlines in both cases', function() {
            expect(checker.checkString('if (true) {\nabc();abc();\n}')).to.have.validation.error.count.which.equals(2);
        });

        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\n\nabc();abc();\n\n}')).to.have.no.errors();
        });

        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });

        it('should not report single statement functions', function() {
            expect(checker.checkString('var a = function() {abc();};')).to.have.no.errors();
        });
    });
});
