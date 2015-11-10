var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-comma-before-line-break', function() {

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCommaBeforeLineBreak: true });
    });

    it('should report illegal comma placement in multiline var declaration', function() {
        expect(checker.checkString('var a\n,b;')).to.have.one.validation.error.from('requireCommaBeforeLineBreak');
    });

    it('should report illegal comma placement in multiline array declaration', function() {
        expect(checker.checkString('var a = [1\n,2];'))
          .to.have.one.validation.error.from('requireCommaBeforeLineBreak');
    });

    it('should report illegal comma placement in multiline object declaration', function() {
        expect(checker.checkString('var a = {a:1\n,c:3};'))
          .to.have.one.validation.error.from('requireCommaBeforeLineBreak');
    });

    it('should not report legal comma placement in multiline var declaration', function() {
        expect(checker.checkString('var a,\nb;')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline array declaration', function() {
        expect(checker.checkString('var a = [1,\n2];')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline sparse array declaration', function() {
        expect(checker.checkString('var a = [1,\n,\n,\n2];')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline object declaration', function() {
        expect(checker.checkString('var a = {a:1,\nc:3};')).to.have.no.errors();
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
