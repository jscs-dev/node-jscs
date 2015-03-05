var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireNewlineBeforeBlockStatements: true });
        });

        it('should report missing newline before opening brace', function() {
            assert(checker.checkString('function test() {abc();}').getErrorCount() === 1);
        });

        it('should report missing newline before opening brace when there are white-spaces between', function() {
            assert(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}').getErrorCount() === 1);
        });

        it('should not report missing newline if there is one', function() {
            assert(checker.checkString('function test()\n{abc();}').isEmpty());
        });

        it('should not report missing newline if there are more of them combined with white-spaces', function() {
            assert(checker.checkString('function test()       \n    \n/*BLOCK*/   {abc();}').isEmpty());
        });

        it('should not report missing newline for object definitions', function() {
            assert(checker.checkString('function test()\n{var obj = {a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}')
                .isEmpty());
        });

        it('should report missing newline only for function definition block statement', function() {
            assert(checker.checkString('function test(){var obj = {a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}')
                .getErrorCount() === 1);
        });

        it('should report missing newline for all 3 statements', function() {
            assert(checker.checkString('function test(){\nif(true){\nreturn 1;\n}\nfor(var i in [1,2,3]){\n}\n}')
                .getErrorCount() === 3);
        });

        it('should not report missing newline', function() {
            assert(checker.checkString('function test()\n{\nif(true)\n{\nreturn 1;\n}\nfor(var i in [1,2,3])\n{\n}\n}')
                .isEmpty());
        });

        it('should not throw error if opening parentheses is first symbol in the file', function() {
            assert(checker.checkString('{test: 1 }').isEmpty());
        });
    });
});
