var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-blocks-on-newline', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: true });
        });

        it('should report missing newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();\n}'))
            .to.have.one.error.from('ruleName');
        });
        it('should report missing newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();}'))
            .to.have.one.error.from('ruleName');
        });
        it('should report missing newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();}')).to.have.validation.error.count.which.equals(2);
        });
        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\nabc();\n}')).to.have.no.errors();
        });
        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });
    });

    describe.skip('option value 1', function() {
        beforeEach(function() {
            checker.configure({ requireBlocksOnNewline: 1 });
        });

        it('should report missing newline after opening brace', function() {
            expect(checker.checkString('if (true) {abc();abc();\n}'))
            .to.have.one.error.from('ruleName');
        });
        it('should report missing newline before closing brace', function() {
            expect(checker.checkString('if (true) {\nabc();abc();}'))
            .to.have.one.error.from('ruleName');
        });
        it('should report missing newlines in both cases', function() {
            expect(checker.checkString('if (true) {abc();abc();}')).to.have.validation.error.count.which.equals(2);
        });
        it('should not report with no spaces', function() {
            expect(checker.checkString('if (true) {\nabc();abc();\n}')).to.have.no.errors();
        });
        it('should not report empty function definitions', function() {
            expect(checker.checkString('var a = function() {};')).to.have.no.errors();
        });
        it('should not report single statement functions', function() {
            expect(checker.checkString('var a = function() {abc();};')).to.have.no.errors();
        });
    });
});
