var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with option value true - ', function() {
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

    describe('with option value array - ', function() {
        describe('"if" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
            });

            it('should report missing newlines when configured with "if"', function() {
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "if" and newline exists', function() {
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "if"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['else'] });
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .isEmpty());
            });
        });

        describe('"else" and "else if" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['else'] });
            });

            it('should report missing newlines when configured with "else"', function() {
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse{\n\tx--;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "else" and newline exists', function() {
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "else"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse{\n\tx--;\n}')
                    .isEmpty());
            });
        });

        describe('"for" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report missing newlines when configured with "for"', function() {
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "for" and newline exists', function() {
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}')
                    .isEmpty());
            });

            it('should not complain when note configured with "for"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}')
                    .isEmpty());
            });
        });

        describe('"for...in" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report missing newlines when configured with "for"', function() {
                assert(checker.checkString('for (var i in x) {\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "for" and newline exists', function() {
                assert(checker.checkString('for (var i in x)\n{\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "for"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('for (var i in x) {\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('function declarations', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report missing newlines when configured with "function"', function() {
                assert(checker.checkString('function myFunc(y) {\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "function" and newline exists', function() {
                assert(checker.checkString('function myFunc(y)\n{\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('function myFunc(y) {\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('function statements', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report missing newlines when configured with "function"', function() {
                assert(checker.checkString('var z = function(y) {\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "function" and newline exists', function() {
                assert(checker.checkString('var z = function(y)\n{\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('var z = function(y) {\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('"try" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['try'] });
            });

            it('should report missing newlines when configured with "try"', function() {
                assert(checker.checkString('try {\n\ty++;\n}\ncatch(e)\n{\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "try" and newline exists', function() {
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally\n{\n\tq = 5;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "try"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try {\n\ty++;\n}\ncatch(e)\n{\n}')
                    .isEmpty());
            });
        });

        describe('"catch" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['catch'] });
            });

            it('should report missing newlines when configured with "catch"', function() {
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e) {\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "catch" and newline exists', function() {
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "catch"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e) {\n}')
                    .isEmpty());
            });
        });

        describe('"finally" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['finally'] });
            });

            it('should report missing newlines when configured with "finally"', function() {
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally {\n\tq = 5;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "finally" and newline exists', function() {
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally\n{\n\tq = 5;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "finally"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally {\n\tq = 5;\n}')
                    .isEmpty());
            });
        });

        describe('"while" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['while'] });
            });

            it('should report missing newlines when configured with "while"', function() {
                assert(checker.checkString('while (x < 10) {\n\tx++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "while" and newline exists', function() {
                assert(checker.checkString('while (x < 10)\n{\n\tx++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "while"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('while (x < 10) {\n\tx++;\n}')
                    .isEmpty());
            });
        });

        describe('"do...while" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['do'] });
            });

            it('should report missing newlines when configured with "do"', function() {
                assert(checker.checkString('do {\n\tx++;\n}\nwhile (x < 10);')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "do" and newline exists', function() {
                assert(checker.checkString('do\n{\n\tx++;\n}\nwhile (x < 10);')
                    .isEmpty());
            });

            it('should not complain when not configured with "do"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('do {\n\tx++;\n}\nwhile (x < 10);')
                    .isEmpty());
            });
        });

        describe('other block types', function() {
            beforeEach(function() {
                checker.configure({
                    requireNewlineBeforeBlockStatements: [
                        'if',
                        'else',
                        'try',
                        'catch',
                        'finally',
                        'do',
                        'while',
                        'for',
                        'function'
                    ]
                });
            });

            it('should be ignored', function() {
                assert(checker.checkString('{ var y = { "things": "stuff" }; }')
                    .isEmpty());
            });
        });
    });
});
