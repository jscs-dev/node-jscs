var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('function test() {abc();}'))
              .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
        });

        it('should report missing newline before opening brace for "switch"', function() {
            expect(checker.checkString('switch (a) {\n\tcase 1: break;\n}'))
                .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
        });

        it('should report missing newline before opening brace when there are white-spaces between', function() {
            expect(checker.checkString('function test()      /* COOOMMMENTTT*/ {abc();}'))
              .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
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
              .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
        });

        it('should report missing newline for all 4 statements', function() {
            expect(checker.checkString([
                'function test(){',
                  'if(true){',
                    'switch (a){',
                      'case 1: break;',
                    '}',
                    'return 1;',
                  '}',
                  'for(var i in [1,2,3]){',
                  '}',
                '}'
            ].join('\n'))).to.have.error.count.equal(4);
        });

        it('should not report missing newline', function() {
            expect(checker.checkString([
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
            ].join('\n'))).to.have.no.errors();
        });

        it('should not throw error if opening parentheses is first symbol in the file', function() {
            expect(checker.checkString('{test: 1 }')).to.have.no.errors();
        });

        it('should not affect bare blocks #1328', function() {
            expect(checker.checkString([
                'exports.NamedNodeMap = NamedNodeMap;',
                '',
                '{',
                'let prototype = NamedNodeMap.prototype;',
                'while (prototype)',
                '{',
                  'for (const name of Object.getOwnPropertyNames(prototype))',
                  '{',
                    'reservedNames.add(name);',
                  '}',
                  'prototype = Object.getPrototypeOf(prototype);',
                '}',
              '}'
            ].join('\n'))).to.have.no.errors();
        });
    });

    describe('with option value array - ', function() {
        describe('"if" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
            });

            it('should report missing newlines when configured with "if"', function() {
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "if" and newline exists', function() {
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "if"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['else'] });
                expect(checker.checkString('if(i == 0) {\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}')).to.have.no.errors();
            });
        });

        describe('"else" and "else if" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['else'] });
            });

            it('should report missing newlines when configured with "else"', function() {
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse{\n\tx--;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "else" and newline exists', function() {
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse\n{\n\tx--;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "else"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('if(i == 0)\n{\n\tx++;\n\ty = {\n\t\tb: "1"\n\t};\n}\nelse{\n\tx--;\n}'))
                  .to.have.no.errors();
            });
        });

        describe('"for" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report missing newlines when configured with "for"', function() {
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "for" and newline exists', function() {
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i)\n{\n\tx++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "for"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('for (var i = 0, len = 10; i < 10; ++i) {\n\tx++;\n}')).to.have.no.errors();
            });
        });

        describe('"switch" statements', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['switch'] });
            });

            it('should report missing newlines when configured with "switch"', function() {
                expect(checker.checkString('switch (a) {\n\tcase 1: break;\n}'))
                    .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should report missing newline before opening brace when there are white-spaces between', function() {
                expect(checker.checkString('switch (a)      /* COOOMMMENTTT*/ {\n\tcase 1: break;\n}'))
                    .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not report missing newline if there are more of them combined with white-spaces', function() {
                expect(checker.checkString('switch (a)       \n    \n/*BLOCK*/   {\n\tcase 1: break;\n}'))
                    .to.have.no.errors();
            });

            it('should complain when configured with "switch" and no cases', function() {
                expect(checker.checkString('switch (a) {\n}'))
                    .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should complain when configured with "switch" and parenthesized discriminant', function() {
                expect(checker.checkString('switch ((function(){}())) {\n\tcase 1: break;\n}'))
                    .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "switch" and newline exists', function() {
                expect(checker.checkString('switch (a)\n{\n\tcase 1: break;\n}')).to.have.no.errors();
            });

            it('should not complain when configured with "switch" and case on brace line', function() {
                expect(checker.checkString('switch (a)\n{default: 1;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "switch"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('switch (a) {\n\tdefault: 1;\n}')).to.have.no.errors();
            });
        });

        describe('"for...in" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
            });

            it('should report missing newlines when configured with "for"', function() {
                expect(checker.checkString('for (var i in x) {\n\ty++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "for" and newline exists', function() {
                expect(checker.checkString('for (var i in x)\n{\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "for"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('for (var i in x) {\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('function declarations', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report missing newlines when configured with "function"', function() {
                expect(checker.checkString('function myFunc(y) {\n\ty++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline exists', function() {
                expect(checker.checkString('function myFunc(y)\n{\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('function myFunc(y) {\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('function expressions', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report missing newlines when configured with "function"', function() {
                expect(checker.checkString('var z = function(y) {\n\ty++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline exists', function() {
                expect(checker.checkString('var z = function(y)\n{\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('var z = function(y) {\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('arrow function expressions', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['function'] });
            });

            it('should report missing newlines when configured with "function"', function() {
                expect(checker.checkString('var z = (y) => {\n\ty++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "function" and newline exists', function() {
                expect(checker.checkString('var z = (y) => \n{\n\ty++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "function"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['if'] });
                expect(checker.checkString('var z = (y) => {\n\ty++;\n}')).to.have.no.errors();
            });
        });

        describe('"try" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['try'] });
            });

            it('should report missing newlines when configured with "try"', function() {
                expect(checker.checkString('try {\n\ty++;\n}\ncatch(e)\n{\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "try" and newline exists', function() {
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally\n{\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "try"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try {\n\ty++;\n}\ncatch(e)\n{\n}')).to.have.no.errors();
            });
        });

        describe('"catch" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['catch'] });
            });

            it('should report missing newlines when configured with "catch"', function() {
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e) {\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "catch" and newline exists', function() {
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "catch"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e) {\n}')).to.have.no.errors();
            });
        });

        describe('"finally" blocks', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['finally'] });
            });

            it('should report missing newlines when configured with "finally"', function() {
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally {\n\tq = 5;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "finally" and newline exists', function() {
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally\n{\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });

            it('should not complain when not configured with "finally"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('try\n{\n\ty++;\n}\ncatch(e)\n{\n}\nfinally {\n\tq = 5;\n}'))
                  .to.have.no.errors();
            });
        });

        describe('"while" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['while'] });
            });

            it('should report missing newlines when configured with "while"', function() {
                expect(checker.checkString('while (x < 10) {\n\tx++;\n}'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "while" and newline exists', function() {
                expect(checker.checkString('while (x < 10)\n{\n\tx++;\n}')).to.have.no.errors();
            });

            it('should not complain when not configured with "while"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('while (x < 10) {\n\tx++;\n}')).to.have.no.errors();
            });
        });

        describe('"do...while" loops', function() {
            beforeEach(function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['do'] });
            });

            it('should report missing newlines when configured with "do"', function() {
                expect(checker.checkString('do {\n\tx++;\n}\nwhile (x < 10);'))
                  .to.have.one.validation.error.from('requireNewlineBeforeBlockStatements');
            });

            it('should not complain when configured with "do" and newline exists', function() {
                expect(checker.checkString('do\n{\n\tx++;\n}\nwhile (x < 10);')).to.have.no.errors();
            });

            it('should not complain when not configured with "do"', function() {
                checker.configure({ requireNewlineBeforeBlockStatements: ['for'] });
                expect(checker.checkString('do {\n\tx++;\n}\nwhile (x < 10);')).to.have.no.errors();
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
                expect(checker.checkString('{ var y = { "things": "stuff" }; }')).to.have.no.errors();
            });
        });
    });
});
