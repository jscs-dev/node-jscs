var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-parentheses-around-iife', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireParenthesesAroundIIFE: true });
    });

    it('should report iife invoked with no parens', function() {
        assert(checker.checkString('var a = function(){return 1;}();').getErrorCount() === 1);
    });

    it('should report iife call()\'ed with no parens', function() {
        assert(checker.checkString('var c = function(){return 3;}.call(this, arg1);').getErrorCount() === 1);
    });

    it('should report iife apply()\'ed with no parens', function() {
        assert(checker.checkString('var d = function(){return d;}.apply(this, args);').getErrorCount() === 1);
    });

    it('should not report non-iife function expressions', function() {
        assert(checker.checkString('var a = function(){return 1;};').isEmpty());
    });

    it('should not report function expressions calls to bind', function() {
        assert(checker.checkString('var a = function(){return 1;}.bind(this);').isEmpty());
    });

    it('should not report function expressions calls to bind then apply', function() {
        assert(checker.checkString('var a = function(){return 1;}.bind(this).apply(that);').isEmpty());
    });

    it('should not report iife invoked with inner parens', function() {
        assert(checker.checkString('var a = (function(){return 1;})();').isEmpty());
    });

    it('should not report iife invoked with outer parens', function() {
        assert(checker.checkString('var b = (function(){return 2;}());').isEmpty());
    });

    it('should not report iife call()\'ed with inner parens', function() {
        assert(checker.checkString('var c = (function(){return 3;}).call(this, arg1);').isEmpty());
    });

    it('should not report iife call()\'ed with outer parens', function() {
        assert(checker.checkString('var d = (function(){return 3;}.call(this, arg1));').isEmpty());
    });

    it('should not report iife apply()\'ed with inner parens', function() {
        assert(checker.checkString('var e = (function(){return d;}).apply(this, args);').isEmpty());
    });

    it('should not report iife apply()\'ed with outer parens', function() {
        assert(checker.checkString('var f = (function(){return d;}.apply(this, args));').isEmpty());
    });
});
