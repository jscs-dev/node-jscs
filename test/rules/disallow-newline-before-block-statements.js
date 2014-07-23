var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowNewlineBeforeBlockStatements: true });
        });

        it('should not report disallowed newline before opening brace', function() {
            assert(checker.checkString('function test() {abc();}').isEmpty());
        });

        it('should not report disallowed newline before opening brace when there are white-spaces between', function() {
            assert(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}').isEmpty());
        });

        it('should report disallowed newline if there is one', function() {
            assert(checker.checkString('function test()\n{abc();}').getErrorCount() === 1);
        });

        it('should report disallowed newline if there are more of them combined with white-spaces', function() {
            assert(checker.checkString('function test()       \n    \n/*BLOCK*/   {abc();}').isEmpty() === false);
        });

        it('should not report disallowed newline for object definitions', function() {
            assert(checker.checkString('function test(){var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}')
                .isEmpty());
        });

        it('should report disallowed newline only for function definition block statement', function() {
            assert(
            checker.checkString('function test()\n{var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}')
                .getErrorCount() === 1);
        });

        it('should report disallowed newline for all 3 statements', function() {
            assert(checker.checkString('function test()\n{\nif(true)\n{\nreturn 1;\n}\nfor(var i in [1,2,3])\n{\n}\n}')
                .getErrorCount() === 3);
        });

        it('should not report disallowed newline', function() {
            assert(checker.checkString(
                'function test(){\nif(true){\nreturn {\nval:1\n}\n}\nvar obj = \n{a:1,\nb:2,\nc:3\n};\n}')
                .isEmpty());
        });
    });
});
