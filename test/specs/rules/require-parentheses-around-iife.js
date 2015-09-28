var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-parentheses-around-iife', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireParenthesesAroundIIFE: true });
    });

    it('should report iife invoked with no parens', function() {
        expect(checker.checkString('var a = function(){return 1;}();'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
    });

    it('should report iife call()\'ed with no parens', function() {
        expect(checker.checkString('var c = function(){return 3;}.call(this, arg1);'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
    });

    it('should report iife apply()\'ed with no parens', function() {
        expect(checker.checkString('var d = function(){return d;}.apply(this, args);'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
    });

    it('should report iife invoked with no trailing semicolon', function() {
        expect(checker.checkString('+function(){return 1;}()'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
        expect(checker.checkString('var a = function(){return 1;}()'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
        expect(checker.checkString('var c = function(){return 3;}.call(this, arg1)'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
        expect(checker.checkString('var d = function(){return d;}.apply(this, args)'))
          .to.have.one.validation.error.from('requireParenthesesAroundIIFE');
    });

    it('should not report non-iife function expressions', function() {
        expect(checker.checkString('var a = function(){return 1;};')).to.have.no.errors();
    });

    it('should not report function expressions calls to bind', function() {
        expect(checker.checkString('var a = function(){return 1;}.bind(this);')).to.have.no.errors();
    });

    it('should not report function expressions calls to bind then apply', function() {
        expect(checker.checkString('var a = function(){return 1;}.bind(this).apply(that);')).to.have.no.errors();
    });

    it('should not report iife invoked with inner parens', function() {
        expect(checker.checkString('var a = (function(){return 1;})();')).to.have.no.errors();
    });

    it('should not report iife invoked with outer parens', function() {
        expect(checker.checkString('var b = (function(){return 2;}());')).to.have.no.errors();
    });

    it('should not report iife call()\'ed with inner parens', function() {
        expect(checker.checkString('var c = (function(){return 3;}).call(this, arg1);')).to.have.no.errors();
    });

    it('should not report iife call()\'ed with outer parens', function() {
        expect(checker.checkString('var d = (function(){return 3;}.call(this, arg1));')).to.have.no.errors();
    });

    it('should not report iife apply()\'ed with inner parens', function() {
        expect(checker.checkString('var e = (function(){return d;}).apply(this, args);')).to.have.no.errors();
    });

    it('should not report iife apply()\'ed with outer parens', function() {
        expect(checker.checkString('var f = (function(){return d;}.apply(this, args));')).to.have.no.errors();
    });
});
