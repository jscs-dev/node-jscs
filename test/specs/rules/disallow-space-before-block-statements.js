var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-space-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeBlockStatements: true });
    });

    it('should report extra space for control structures', function() {
        expect(checker.checkString('if (true) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('if (true)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        assert(checker.checkString('if (true){ var a = false; }').getValidationErrorCount() === 0);
    });

    it('should report extra space for control structures with multiple branches', function() {
        assert(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '} else {\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 2, 'incorrect if and else');

        assert(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '}\n' +
          'else{\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 1, 'incorrect if, correct else');

        assert(checker.checkString(
          'if (true) {\n' +
          '    var a = false;\n' +
          '}\n' +
          'else if (true) {\n' +
          '    var b = false;\n' +
          '}\n' +
          'else{\n' +
          '    var c = false;\n' +
          '}').getValidationErrorCount() === 2, 'incorrect if & else if, correct else');

        assert(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}\n' +
          'else {\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 1, 'correct if, incorrect else');

        assert(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}else{\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 0, 'no spaces: correct if and else');

        assert(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '}\n' +
          'else{\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 0, 'stroustrup: correct if and else');

        assert(checker.checkString(
          'if (true){\n' +
          '    var a = false;\n' +
          '} else{\n' +
          '    var b = false;\n' +
          '}').getValidationErrorCount() === 0, '1tbs: correct if and else');
    });

    it('should report extra space for loops', function() {
        expect(checker.checkString('while (true) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('while (true)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        assert(checker.checkString('while (true){ var a = false; }').getValidationErrorCount() === 0);
        expect(checker.checkString('for (var e in es) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('for (var e in es)\n{ var a = false; }'))
            .to.have.one.error.from('ruleName');
        assert(checker.checkString('for (var e in es){ var a = false; }').getValidationErrorCount() === 0);
    });

    it('should report extra space for function declarations', function() {
        expect(checker.checkString('function foo(i) { var a = false; }'))
            .to.have.one.error.from('ruleName');
        assert(checker.checkString('function foo(i){ var a = false; }').getValidationErrorCount() === 0);
    });

    it('should not affect object decls', function() {
        assert(checker.checkString('var a ={};').getValidationErrorCount() === 0);
        assert(checker.checkString('var a ={id:5};').getValidationErrorCount() === 0);
        assert(checker.checkString('var a = {};').getValidationErrorCount() === 0);
        assert(checker.checkString('var a = {id:5};').getValidationErrorCount() === 0);
    });
});
