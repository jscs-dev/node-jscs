var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-comma-before-line-break', function() {
    var checker;
    var input;
    var output;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowCommaBeforeLineBreak: true });
    });

    describe('illegal comma placement in multiline var declaration', function() {
        beforeEach(function() {
            input = 'var a,\nb;';
            output = 'var a, b;';
        });

        it('should report', function() {
            assert(checker.checkString(input).getErrorCount() === 1);
        });

        it('should fix', function() {
            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, output);
        });
    });

    describe('illegal comma placement in multiline array declaration', function() {
        beforeEach(function() {
            input = 'var a = [1,\n2];';
            output = 'var a = [1, 2];';
        });

        it('should report', function() {
            assert(checker.checkString(input).getErrorCount() === 1);
        });

        it('should fix', function() {
            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, output);
        });
    });

    describe('illegal comma placement in multiline object declaration', function() {
        beforeEach(function() {
            input = 'var a = {a:1,\nc:3};';
            output = 'var a = {a:1, c:3};';
        });

        it('should report', function() {
            assert(checker.checkString(input).getErrorCount() === 1);
        });

        it('should fix', function() {
            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, output);
        });
    });

    it('should not report legal comma placement in multiline var declaration', function() {
        assert(checker.checkString('var a\n,b;').isEmpty());
    });

    it('should not report legal comma placement in multiline array declaration', function() {
        assert(checker.checkString('var a = [1\n,2];').isEmpty());
    });

    it('should not report legal comma placement in multiline object declaration', function() {
        assert(checker.checkString('var a = {a:1\n,c:3};').isEmpty());
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
