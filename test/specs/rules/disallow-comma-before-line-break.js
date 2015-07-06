var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-comma-before-line-break', function() {
    var rules = { disallowCommaBeforeLineBreak: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    reportAndFix({
        name: 'illegal comma placement in multiline var declaration',
        rules: rules,
        input: 'var a,\nb;',
        output: 'var a, b;'
    });

    reportAndFix({
        name: 'illegal comma placement in multiline array declaration',
        rules: rules,
        input: 'var a = [1,\n2];',
        output: 'var a = [1, 2];'
    });

    reportAndFix({
        name: 'illegal comma placement in multiline object declaration',
        rules: rules,
        input: 'var a = {a:1,\nc:3};',
        output: 'var a = {a:1, c:3};'
    });

    it('should not report legal comma placement in multiline var declaration', function() {
        expect(checker.checkString('var a\n,b;')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline array declaration', function() {
        expect(checker.checkString('var a = [1\n,2];')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline object declaration', function() {
        expect(checker.checkString('var a = {a:1\n,c:3};')).to.have.no.errors();
    });

    it('should not report comma placement in a comment', function() {
        expect(checker.checkString('var a;/*var a\n,b\n,c;*/')).to.have.no.errors();
    });

    it('should not report comma placement in single line var declaration', function() {
        expect(checker.checkString('var a, b;')).to.have.no.errors();
    });

    it('should not report comma placement in single line array declaration', function() {
        expect(checker.checkString('var a = [1, 2];')).to.have.no.errors();
    });

    it('should not report comma placement in single line object declaration', function() {
        expect(checker.checkString('var a = {a:1, c:3};')).to.have.no.errors();
    });
});
