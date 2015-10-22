var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('boolean option', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBeforeBlockStatements: true});
        });

        it('should report missing space for control structures', function() {
            expect(checker.checkString('if (true) { var a = false; }')).to.have.no.errors();
            expect(checker.checkString('if (true)\n{ var a = false; }')).to.have.no.errors();
            expect(checker.checkString('if (true){ var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
        });

        it('should report missing space for loops', function() {
            expect(checker.checkString('while (true) { var a = false; }')).to.have.no.errors();
            expect(checker.checkString('while (true)\n{ var a = false; }')).to.have.no.errors();
            expect(checker.checkString('while (true){ var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
            expect(checker.checkString('for (var e in es) { var a = false; }')).to.have.no.errors();
            expect(checker.checkString('for (var e in es)\n{ var a = false; }')).to.have.no.errors();
            expect(checker.checkString('for (var e in es){ var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
        });

        it('should report missing space for function declarations', function() {
            expect(checker.checkString('function foo(i) { var a = false; }')).to.have.no.errors();
            expect(checker.checkString('function foo(i){ var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
        });

        it('should not affect object decls', function() {
            expect(checker.checkString('var a ={};')).to.have.no.errors();
            expect(checker.checkString('var a ={id:5};')).to.have.no.errors();
            expect(checker.checkString('var a = {};')).to.have.no.errors();
            expect(checker.checkString('var a = {id:5};')).to.have.no.errors();
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

        it('should missing space for control structures with multiple branches', function() {
            expect(checker.checkString(
              'if (true) {\n' +
              '    var a = false;\n' +
              '} else {\n' +
              '    var b = false;\n' +
              '}')).to.have.no.errors();

            expect(checker.checkString(
              'if (true) {\n' +
              '    var a = false;\n' +
              '}\n' +
              'else{\n' +
              '    var b = false;\n' +
              '}')).to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');

            expect(checker.checkString(
              'if (true) {\n' +
              '    var a = false;\n' +
              '}\n' +
              'else if (true) {\n' +
              '    var b = false;\n' +
              '}\n' +
              'else{\n' +
              '    var c = false;\n' +
              '}')).to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');

            expect(checker.checkString(
              'if (true){\n' +
              '    var a = false;\n' +
              '}\n' +
              'else {\n' +
              '    var b = false;\n' +
              '}')).to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');

            expect(checker.checkString(
              'if (true){\n' +
              '    var a = false;\n' +
              '}else{\n' +
              '    var b = false;\n' +
              '}')).to.have.error.count.equal(2);

            expect(checker.checkString(
              'if (true) {\n' +
              '    var a = false;\n' +
              '}\n' +
              'else {\n' +
              '    var b = false;\n' +
              '}')).to.have.no.errors();

            expect(checker.checkString(
              'if (true) {\n' +
              '    var a = false;\n' +
              '} else {\n' +
              '    var b = false;\n' +
              '}')).to.have.no.errors();
        });
    });

    describe('integer option', function() {
        beforeEach(function() {
            checker.configure({ requireSpaceBeforeBlockStatements: 2});
        });

        it('should report errors if spacing is incorrect with minimum integer specified as option', function() {
            expect(checker.checkString('function foo(i){ var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
            expect(checker.checkString('function foo(i) { var a = false; }'))
              .to.have.one.validation.error.from('requireSpaceBeforeBlockStatements');
            expect(checker.checkString('function foo(i)  { var a = false; }')).to.have.no.errors();
            expect(checker.checkString('function foo(i)   { var a = false; }')).to.have.no.errors();
        });
    });
});
