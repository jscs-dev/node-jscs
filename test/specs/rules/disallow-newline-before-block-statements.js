var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
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
            name: 'disallowed newline for all 4 statements',
            rules: { disallowNewlineBeforeBlockStatements: true },
            input: [
                'function test()',
                '{',
                  'if(true)',
                  '{',
                    'switch (a)',
                    '{',
                      'case 1: break;',
                    '}',
                    'return 1;',
                  '}',
                  'for(var i in [1,2,3])',
                  '{',
                  '}',
                '}'
            ].join('\n'),
            output: [
                'function test() {',
                  'if(true) {',
                    'switch (a) {',
                      'case 1: break;',
                    '}',
                    'return 1;',
                  '}',
                  'for(var i in [1,2,3]) {',
                  '}',
                '}'
            ].join('\n'),
            errors: 4
        });

        it('should not report disallowed newline before opening brace', function() {
            expect(checker.checkString('function test() {abc();}')).to.have.no.errors();
        });

        it('should not report disallowed newline before opening brace when there are white-spaces between', function() {
            expect(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}')).to.have.no.errors();
        });

        it('should not report disallowed newline for object definitions', function() {
            expect(checker.checkString('function test(){var obj = \n{a:1,\nb:2,\nc:3\n};\n\n return {\nval:1\n};\n}'))
              .to.have.no.errors();
        });

        it('should not report disallowed newline', function() {
            expect(checker.checkString(
                'function test(){\nif(true){\nreturn {\nval:1\n}\n}\nvar obj = \n{a:1,\nb:2,\nc:3\n};\n}'))
              .to.have.no.errors();
        });

        it('should not throw error if opening parentheses is first symbol in the file', function() {
            expect(checker.checkString('{ test: 1 }')).to.have.no.errors();
        });

        it('should not affect bare blocks #1328', function() {
            expect(checker.checkString([
                'exports.NamedNodeMap = NamedNodeMap;',
                '',
                '{',
                'let prototype = NamedNodeMap.prototype;',
                'while (prototype) {',
                  'for (const name of Object.getOwnPropertyNames(prototype)) {',
                    'reservedNames.add(name);',
                  '}',
                  'prototype = Object.getPrototypeOf(prototype);',
                '}',
              '}'
            ].join('\n'))).to.have.no.errors();
        });

        it('should not affect bare blocks with a parent BlockStatement #1328', function() {
            expect(checker.checkString([
                'function a() {',
                  'let b = 1;',
                  '',
                  '{',
                    'let c = 1;',
                  '} ',
                '}'
            ].join('\n'))).to.have.no.errors();
        });
    });

    describe('with option value array - ', function() {
        describe('"if" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
            });

            it('should report extra newlines when configured with "if"', function() {
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "if" and newline not added', function() {
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "if"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['else'] });
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')).to.have.no.errors();
            });
        });

        describe('"else" and "else if" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['else'] });
            });

            it('should report extra newlines when configured with "else"', function() {
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "else" and newline not added', function() {
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse {\n\tx--;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "else"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}'))
                  .to.have.no.errors();
            });
        });

        describe('"for" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report extra newlines when configured with "for"', function() {
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "for" and newline not added', function() {
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}')).to.have.no.errors();
            });

            it('should not complain when note configured with "for"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}')).to.have.no.errors();
            });
        });

        describe('"switch" statements', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['switch'] });
            });

            it('should report extra newlines when configured with "switch"', function() {
                expect(checker.checkString('switch (a)\n{\n\tcase 1: break;\n}'))
                    .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not report newline before opening brace when there are white-spaces between', function() {
                expect(checker.checkString('switch (a)      /* COOOMMMENTTT*/ {case 1: break;}')).to.have.no.errors();
            });

            it('should complain when configured with "switch" and no cases', function() {
                expect(checker.checkString('switch (a)\n{\n}'))
                    .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should complain when configured with "switch" and parenthesized discriminant', function() {
                expect(checker.checkString('switch ((function(){}()))\n{\n\tcase 1: break;\n}'))
                    .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "switch" and case on brace line', function() {
                expect(checker.checkString('switch (a) {default: 1;\n}')).to.have.no.errors();
            });

            it('should not complain when configured with "switch" and newline not added', function() {
                expect(checker.checkString('switch (a) {\n\tcase 1: break;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "switch"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('switch (a)\n{\n\tcase 1: break;\n}')).to.have.no.errors();
            });
        });

        describe('"for...in" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report extra newlines when configured with "for"', function() {
                expect(checker.checkString('for (var i in x)\n{\n\ty++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "for" and newline not added', function() {
                expect(checker.checkString('for (var i in x) {\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "for"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('for (var i in x)\n{\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('function declarations', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report extra newlines when configured with "function"', function() {
                expect(checker.checkString('function myFunc(y)\n{\n\ty++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline not added', function() {
                expect(checker.checkString('function myFunc(y) {\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('function myFunc(y)\n{\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('function expressions', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report extra newlines when configured with "function"', function() {
                expect(checker.checkString('var z = function(y)\n{\n\ty++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline not added', function() {
                expect(checker.checkString('var z = function(y) {\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('var z = function(y)\n{\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('arrow function expressions', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report extra newlines when configured with "function"', function() {
                expect(checker.checkString('var z = (y) => \n{\n\ty++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline not added', function() {
                expect(checker.checkString('var z = (y) => {\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('var z = (y) => \n{\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('"try" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['try'] });
            });

            it('should report extra newlines when configured with "try"', function() {
                expect(checker.checkString('try\n{\n\ty++;\n} catch(e) {\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "try" and newline not added', function() {
                expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n}\nfinally\n{\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "try"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try\n{\n\ty++;\n} catch(e) {\n}')).to.have.no.errors();
            });
        });

        describe('"catch" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['catch'] });
            });

            it('should report extra newlines when configured with "catch"', function() {
                expect(checker.checkString('try {\n\ty++;\n} catch(e)\n{\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "catch" and newline not added', function() {
                expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "catch"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try {\n\ty++;\n} catch(e)\n{\n}')).to.have.no.errors();
            });
        });

        describe('"finally" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['finally'] });
            });

            it('should report extra newlines when configured with "finally"', function() {
                expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally\n{\n\tq = 5;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "finally" and newline not added', function() {
                expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally {\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "finally"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n} finally\n{\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });
        });

        describe('"while" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['while'] });
            });

            it('should report extra newlines when configured with "while"', function() {
                expect(checker.checkString('while (x < 10)\n{\n\tx++;\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "while" and newline not added', function() {
                expect(checker.checkString('while (x < 10) {\n\tx++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "while"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('while (x < 10)\n{\n\tx++;\n}')).to.have.no.errors();
            });
        });

        describe('"do...while" loops', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['do'] });
            });

            it('should report extra newlines when configured with "do"', function() {
                expect(checker.checkString('do\n{\n\tx++;\n} while (x < 10);'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "do" and newline not added', function() {
                expect(checker.checkString('do {\n\tx++;\n} while (x < 10);')).to.have.no.errors();
            });

            it('should not complain when not configured with "do"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('do\n{\n\tx++;\n} while (x < 10);')).to.have.no.errors();
            });
        });

        describe('"class" blocks', function() {
            beforeEach(function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['class'] });
            });

            it('should report extra newlines when configured with "class"', function() {
                expect(checker.checkString('class Foo \r\n{\r\n\tfoo () {\r\n\t\treturn 1;\r\n\t}\r\n}'))
                  .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "class" and newline not added', function() {
                expect(checker.checkString('class Foo {\r\n\tfoo () {\r\n\t\treturn 1;\r\n\t}\r\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "class"', function() {
                checker.configure({ disallowNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('class Foo {\r\n\tfoo () {\r\n\t\treturn 1;\r\n\t}\r\n}'))
                  .to.have.no.errors();
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
                expect(checker.checkString('{\nvar y = { "things": "stuff" };\n}')).to.have.no.errors();
            });
        });
    });

    describe('with option value object and allExcept multiLine - ', function() {
        beforeEach(function() {
            checker.configure({
                disallowNewlineBeforeBlockStatements: {
                    value: true,
                    allExcept: ['multiLine']
                }
            });
        });

        it('misc checks', function() {
            expect(checker.checkString('function foo(a,b) { }'))
                .to.have.no.errors();

            expect(checker.checkString('function foo(a,\nb) { }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('switch((function(){}\n())) { }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('function foo() { for (var i=0; i<len; i++) { } }'))
                .to.have.no.errors();

            expect(checker.checkString('function foo() { for (var i=0; i<len;\ni++) { } }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('function foo() { for (var i=0; i<len;\ni++)\n{ } }'))
                .to.have.no.errors();

            expect(checker.checkString('function foo() { if (true) { } }'))
                .to.have.no.errors();

            expect(checker.checkString('function foo() { if (a && b()) { } }'))
                .to.have.no.errors();

            expect(checker.checkString('function foo() { if (a &&\nb()) { } }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('function foo() { if (a &&\nb())\n{ } }'))
                .to.have.no.errors();

            expect(checker.checkString('(function () {}())'))
                .to.have.no.errors();

            expect(checker.checkString('try {\n\ty++;\n} catch(e) {\n}'))
                .to.have.no.errors();
        });

        it('"switch" statements', function() {
            expect(checker.checkString('switch((function(){}\n())) { }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('switch((function(){}()))\n{ }'))
                .to.have.one.validation.error.from('disallowNewlineBeforeBlockStatements');

            expect(checker.checkString('switch((function(){}\n()))\n{ }'))
                .to.have.no.errors();
        });
    });
});
