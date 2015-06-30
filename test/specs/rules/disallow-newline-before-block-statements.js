var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe.skip('rules/disallow-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowNewlineBeforeBlockStatements: true });
        });

        reportAndFix({
            name: 'disallowed newline if there is one',
            rules: { disallowNewlineBeforeBlockStatements: true },
            input: 'function test()\n{abc();}',
            output: 'function test() {abc();}'
        });

        reportAndFix({
            name: 'disallowed newline only for function definition block statement',
            rules: { disallowNewlineBeforeBlockStatements: true },
            input: 'function test()\n{var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}',
            output: 'function test() {var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}'
        });

        reportAndFix({
            name: 'disallowed newline for all 3 statements',
            rules: { disallowNewlineBeforeBlockStatements: true },
            input: 'function test()\n{\nif(true)\n{\nreturn 1;\n}\nfor(var i in [1,2,3])\n{\n}\n}',
            output: 'function test() {\nif(true) {\nreturn 1;\n}\nfor(var i in [1,2,3]) {\n}\n}',
            errors: 3
        });

        it('should not report disallowed newline before opening brace', function() {
            expect(checker.checkString('function test() {abc();}')).to.have.no.errors();
        });

        it('should not report disallowed newline before opening brace when there are white-spaces between', function() {
            expect(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}')).to.have.no.errors();
        });

        it('should not report disallowed newline for object definitions', function() {
            assert(checker.checkString('function test(){var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}')
                .isEmpty());
        });

        it('should not report disallowed newline', function() {
            assert(checker.checkString(
                'function test(){\nif(true){\nreturn {\nval:1\n}\n}\nvar obj = \n{a:1,\nb:2,\nc:3\n};\n}')
                .isEmpty());
        });

        it('should not throw error if opening parentheses is first symbol in the file', function() {
            expect(checker.checkString('{ test: 1 }')).to.have.no.errors();
        });
    });
});
