var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-newline-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with option value true -', function() {
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

    describe('with option value array - ', function() {
        describe('"if" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
            });

            it('should report extra newlines when configured with "if"', function() {
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "if" and newline not added', function() {
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "if"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['else'] });
                assert(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')
                    .isEmpty());
            });
        });

        describe('"else" and "else if" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['else'] });
            });

            it('should report extra newlines when configured with "else"', function() {
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "else" and newline not added', function() {
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse {\n\tx--;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "else"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}')
                    .isEmpty());
            });
        });

        describe('"for" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report extra newlines when configured with "for"', function() {
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "for" and newline not added', function() {
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}')
                    .isEmpty());
            });

            it('should not complain when note configured with "for"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}')
                    .isEmpty());
            });
        });

        describe('"for...in" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report extra newlines when configured with "for"', function() {
                assert(checker.checkString('for (var i in x)\n{\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "for" and newline not added', function() {
                assert(checker.checkString('for (var i in x) {\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "for"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('for (var i in x)\n{\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('function declarations', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report extra newlines when configured with "function"', function() {
                assert(checker.checkString('function myFunc(y)\n{\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "function" and newline not added', function() {
                assert(checker.checkString('function myFunc(y) {\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('function myFunc(y)\n{\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('function statements', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report extra newlines when configured with "function"', function() {
                assert(checker.checkString('var z = function(y)\n{\n\ty++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "function" and newline not added', function() {
                assert(checker.checkString('var z = function(y) {\n\ty++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                assert(checker.checkString('var z = function(y)\n{\n\ty++;\n}')
                    .isEmpty());
            });
        });

        describe('"try" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['try'] });
            });

            it('should report extra newlines when configured with "try"', function() {
                assert(checker.checkString('try\n{\n\ty++;\n} catch(e) {\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "try" and newline not added', function() {
                assert(checker.checkString('try {\n\ty++;\n} catch(e) {\n}\nfinally\n{\n\tq = 5;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "try"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try\n{\n\ty++;\n} catch(e) {\n}')
                    .isEmpty());
            });
        });

        describe('"catch" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['catch'] });
            });

            it('should report extra newlines when configured with "catch"', function() {
                assert(checker.checkString('try {\n\ty++;\n} catch(e)\n{\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "catch" and newline not added', function() {
                assert(checker.checkString('try {\n\ty++;\n} catch(e) {\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "catch"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try {\n\ty++;\n} catch(e)\n{\n}')
                    .isEmpty());
            });
        });

        describe('"finally" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['finally'] });
            });

            it('should report extra newlines when configured with "finally"', function() {
                assert(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally\n{\n\tq = 5;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "finally" and newline not added', function() {
                assert(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally {\n\tq = 5;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "finally"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally\n{\n\tq = 5;\n}')
                    .isEmpty());
            });
        });

        describe('"while" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['while'] });
            });

            it('should report extra newlines when configured with "while"', function() {
                assert(checker.checkString('while (x < 10)\n{\n\tx++;\n}')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "while" and newline not added', function() {
                assert(checker.checkString('while (x < 10) {\n\tx++;\n}')
                    .isEmpty());
            });

            it('should not complain when not configured with "while"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('while (x < 10)\n{\n\tx++;\n}')
                    .isEmpty());
            });
        });

        describe('"do...while" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['do'] });
            });

            it('should report extra newlines when configured with "do"', function() {
                assert(checker.checkString('do\n{\n\tx++;\n} while (x < 10);')
                    .getErrorCount() === 1);
            });

            it('should not complain when configured with "do" and newline not added', function() {
                assert(checker.checkString('do {\n\tx++;\n} while (x < 10);')
                    .isEmpty());
            });

            it('should not complain when not configured with "do"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                assert(checker.checkString('do\n{\n\tx++;\n} while (x < 10);')
                    .isEmpty());
            });
        });

        describe('other block types', function() {
            beforeEach(function() {
                checker.configure({
                    disallowNewlineBeforeBlockStatements: [
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
                assert(checker.checkString('{\nvar y = { "things": "stuff" };\n}')
                    .isEmpty());
            });
        });
    });
});
