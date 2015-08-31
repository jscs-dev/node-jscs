var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireNewlineBeforeBlockStatements: true });
        });

        it('should report missing newline before opening brace', function() {
            expect(checker.checkString('function test() {abc();}'))
                .to.have.one.error.from('ruleName');
        });

        it('should report missing newline before opening brace when there are white-spaces between', function() {
            expect(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}'))
                .to.have.one.error.from('ruleName');
        });

        it('should not report missing newline if there is one', function() {
            expect(checker.checkString('function test()\n{abc();}')).to.have.no.errors();
        });

        it('should not report missing newline if there are more of them combined with white-spaces', function() {
            expect(checker.checkString('function test()       \n    \n/*BLOCK*/   {abc();}')).to.have.no.errors();
        });

        it('should not report missing newline for object definitions', function() {
            expect(checker.checkString('function test()\n{var obj = {a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}'))
                .to.have.no.errors();
        });

        it('should report missing newline only for function definition block statement', function() {
            expect(checker.checkString('function test(){var obj = {a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}'))
                .to.have.one.error();
        });

        it('should report missing newline for all 3 statements', function() {
            expect(checker.checkString('function test(){\nif(true){\nreturn 1;\n}\nfor(var i in [1,2,3]){\n}\n}'))
                .to.have.error.count.which.equals(3);
        });

        it('should not report missing newline', function() {
            expect(checker.checkString('function test()\n{\nif(true)\n{\nreturn 1;\n}\nfor(var i in [1,2,3])\n{\n}\n}'))
                .to.have.no.errors();
        });

        it('should not throw error if opening parentheses is first symbol in the file', function() {
            expect(checker.checkString('{test: 1 }')).to.have.no.errors();
        });
    });
});
