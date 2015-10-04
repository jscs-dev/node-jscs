var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').binaryOperators.slice();
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-operator-before-line-break', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        [[operator], true].forEach(function(value) {
            it('should report newline before ' + operator + ' with ' + value + ' value', function() {
                checker.configure({ requireOperatorBeforeLineBreak: value });
                expect(checker.checkString('var x = y \n' + operator + ' String'))
                  .to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
            });

            it('should not report newline after ' + operator + ' with ' + value + ' value', function() {
                checker.configure({ requireOperatorBeforeLineBreak: value });
                expect(checker.checkString('var x = y ' + operator + '\n String')).to.have.no.errors();
            });
        });
    });

    it('should report newline before ternary with true value', function() {
        checker.configure({ requireOperatorBeforeLineBreak: true });
        expect(checker.checkString('var x = y \n? a : b'))
          .to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
    });
    it('should not report newline before colon', function() {
        checker.configure({ requireOperatorBeforeLineBreak: [':'] });
        expect(checker.checkString('({ test \n : 1 })')).to.have.no.errors();
    });
    it('should not report newline before ternary without option', function() {
        checker.configure({ requireOperatorBeforeLineBreak: [':'] });
        expect(checker.checkString('var x = y \n? a : b')).to.have.no.errors();
    });
    it('should report newline before ternary', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['?'] });
        expect(checker.checkString('var x = y \n? a : b'))
          .to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
    });
    it('should not report newline after ternary', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['?'] });
        expect(checker.checkString('var x = y ?\n a : b')).to.have.no.errors();
    });
    it('should not report newline for the unary operator', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['-'] });
        expect(checker.checkString('[\n-1, \n2]')).to.have.no.errors();
    });
    it('should not report anything if nothing is defined', function() {
        checker.configure({ requireOperatorBeforeLineBreak: [''] });
        expect(checker.checkString('var x = y \n? a : b')).to.have.no.errors();
        expect(checker.checkString('var x = y \n + String')).to.have.no.errors();
    });
    it('should not confuse unary operator with binary one #413', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['+'] });
        expect(checker.checkString('test === "null" ? \n +test + "" : test')).to.have.no.errors();
    });
    it('should not confuse unary with binary operator, but do report errors if needed', function() {
        checker.configure({ requireOperatorBeforeLineBreak: ['?', '+'] });
        expect(checker.checkString('test === "null" \n? +test + "" : test'))
          .to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
    });
    it('should report after a binary operator with a literal on the left hand side #733', function() {
        checker.configure({ requireOperatorBeforeLineBreak: true });
        expect(checker.checkString('var err = "Cannot call " + modelName \n + " !";'))
          .to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
    });
    it('should not autofix line comment on first line', function() {
        checker.configure({ requireOperatorBeforeLineBreak: true });
        var input = 'var x = y // comment \n? a : b';
        var result = checker.fixString(input);
        expect(result.errors).to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
        expect(result.output).to.equal(input);
    });
    it('should not autofix inline comment on first line', function() {
        checker.configure({ requireOperatorBeforeLineBreak: true });
        var input = 'var x = y /* comment */\n? a : b';
        var result = checker.fixString(input);
        expect(result.errors).to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
        expect(result.output).to.equal(input);
    });
    it('should not autofix inline comment on second line', function() {
        checker.configure({ requireOperatorBeforeLineBreak: true });
        var input = 'var x = y\n /* comment */ ? a : b';
        var result = checker.fixString(input);
        expect(result.errors).to.have.one.validation.error.from('requireOperatorBeforeLineBreak');
        expect(result.output).to.equal(input);
    });

    reportAndFix({
        name: 'should fix operator by moving to previous line',
        rules: { requireOperatorBeforeLineBreak: true },
        input: [
          'if (x',
          '    && y) {',
          '  alert(z);',
          '}'
        ].join('\n'),
        output: [
          'if (x &&',
          '    y) {',
          '  alert(z);',
          '}'
        ].join('\n')
    });

    reportAndFix({
        name: 'should fix operator by moving to previous line (respecting comments)',
        rules: { requireOperatorBeforeLineBreak: true },
        input: [
          'if (x',
          '    && /* comment */ y) {',
          '  alert(z);',
          '}'
        ].join('\n'),
        output: [
          'if (x &&',
          '    /* comment */ y) {',
          '  alert(z);',
          '}'
        ].join('\n')
    });
});
