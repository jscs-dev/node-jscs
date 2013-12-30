var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-comma-before-line-break', function() {

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCommaBeforeLineBreak: true });
    });

    it('should report illegal comma placement in multiline var declaration', function() {
        assert(checker.checkString('var a\n,b;').getErrorCount() === 1);
    });

    it('should report illegal comma placement in multiline array declaration', function() {
        assert(checker.checkString('var a = [1\n,2];').getErrorCount() === 1);
    });

    it('should report illegal comma placement in multiline object declaration', function() {
        assert(checker.checkString('var a = {a:1\n,c:3};').getErrorCount() === 1);
    });

    it('should not report legal comma placement in multiline var declaration', function() {
        assert(checker.checkString('var a,\nb;').isEmpty());
    });

    it('should not report legal comma placement in multiline array declaration', function() {
        assert(checker.checkString('var a = [1,\n2];').isEmpty());
    });

    it('should not report legal comma placement in multiline object declaration', function() {
        assert(checker.checkString('var a = {a:1,\nc:3};').isEmpty());
    });

    it('should not report comma placement in a comment', function() {
        assert(checker.checkString('var a;/*var a\n,b\n,c;*/').isEmpty());
    });

    it('should not report comma placement in single line var declaration', function() {
        assert(checker.checkString('var a, b;').isEmpty());
    });

    it('should not report comma placement in single line array declaration', function() {
        assert(checker.checkString('var a = [1, 2];').isEmpty());
    });

    it('should not report comma placement in single line object declaration', function() {
        assert(checker.checkString('var a = {a:1, c:3};').isEmpty());
    });
});
