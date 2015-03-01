var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-newline-before-block-statements', function() {
    var checker;
    var input;
    var output;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowNewlineBeforeBlockStatements: true });
        });

        describe('disallowed newline if there is one', function() {
            beforeEach(function() {
                input = 'function test()\n{abc();}';
                output = 'function test() {abc();}';
            });

            it('should report', function() {
                assert(checker.checkString(input).getErrorCount() === 1);
            });

            it('should fix', function() {
                var result = checker.fixString(input);
                assert(result.errors.isEmpty());
                assert.equal(result.output, output);
            });
        });

        describe('disallowed newline only for function definition block statement', function() {
            beforeEach(function() {
                input = 'function test()\n{var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}';
                output = 'function test() {var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}';
            });

            it('should report', function() {
                assert(checker.checkString(input).getErrorCount() === 1);
            });

            it('should fix', function() {
                var result = checker.fixString(input);
                assert(result.errors.isEmpty());
                assert.equal(result.output, output);
            });
        });

        describe('disallowed newline for all 3 statements', function() {
            beforeEach(function() {
                input = 'function test()\n{\nif(true)\n{\nreturn 1;\n}\nfor(var i in [1,2,3])\n{\n}\n}';
                output = 'function test() {\nif(true) {\nreturn 1;\n}\nfor(var i in [1,2,3]) {\n}\n}';
            });

            it('should report', function() {
                assert(checker.checkString(input).getErrorCount() === 3);
            });

            it('should fix', function() {
                var result = checker.fixString(input);
                assert(result.errors.isEmpty());
                assert.equal(result.output, output);
            });
        });

        it('should not report disallowed newline before opening brace', function() {
            assert(checker.checkString('function test() {abc();}').isEmpty());
        });

        it('should not report disallowed newline before opening brace when there are white-spaces between', function() {
            assert(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}').isEmpty());
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
            assert(checker.checkString('{ test: 1 }').isEmpty());
        });
    });
});
