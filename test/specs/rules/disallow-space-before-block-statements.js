var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeBlockStatements: true });
    });

    it('should report extra space for control structures', function() {
        expect(checker.checkString('if (true) { var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('if (true)\n{ var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('if (true){ var a = false; }')).to.have.no.errors();
    });

    it('should report extra space for control structures with multiple branches', function() {
        expect(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '} else {\n' +
          '    var b = false;\n' +
          '}')).to.have.error.count.equal(2);

        expect(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '}\n' +
          'else{\n' +
          '    var b = false;\n' +
          '}')).to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');

        expect(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '}\n' +
          'else if (true) {\n' +
          '    var b = false;\n' +
          '}\n' +
          'else{\n' +
          '    var c = false;\n' +
          '}')).to.have.error.count.equal(2);

        expect(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}\n' +
          'else {\n' +
          '    var b = false;\n' +
          '}')).to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');

        expect(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}else{\n' +
          '    var b = false;\n' +
          '}')).to.have.no.errors();

        expect(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}\n' +
          'else{\n' +
          '    var b = false;\n' +
          '}')).to.have.no.errors();

        expect(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '} else{\n' +
          '    var b = false;\n' +
          '}')).to.have.no.errors();
    });

    it('should report extra space for loops', function() {
        expect(checker.checkString('while (true) { var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('while (true)\n{ var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('while (true){ var a = false; }')).to.have.no.errors();
        expect(checker.checkString('for (var e in es) { var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('for (var e in es)\n{ var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('for (var e in es){ var a = false; }')).to.have.no.errors();
    });

    it('should report extra space for function declarations', function() {
        expect(checker.checkString('function foo(i) { var a = false; }'))
          .to.have.one.validation.error.from('disallowSpaceBeforeBlockStatements');
        expect(checker.checkString('function foo(i){ var a = false; }')).to.have.no.errors();
    });

    it('should not affect object decls', function() {
        expect(checker.checkString('var a ={};')).to.have.no.errors();
        expect(checker.checkString('var a ={id:5};')).to.have.no.errors();
        expect(checker.checkString('var a = {};')).to.have.no.errors();
        expect(checker.checkString('var a = {id:5};')).to.have.no.errors();
    });
});
