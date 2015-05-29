var Checker = require('../../../lib/checker');
var assert = require('assert');
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

    describe('mode option', function() {
        describe('ignoreFunction value', function() {
            var rules = {disallowCommaBeforeLineBreak: {mode: 'ignoreFunction'}};
            beforeEach(function() {
                checker.configure(rules);
            });
            it('should not report function with ignoreFunction', function() {
                assert(
                    checker.checkString(
                        'var x = {\n' +
                            'a : 1,\n' +
                            'foo : function() {},\n' +
                            'bcd : 2\n' +
                        '};'
                    ).isEmpty()
                );
            });

            reportAndFix({
                name: 'illegal comma placement in multiline object declaration',
                rules: rules,
                input: 'var a = {a:1,\nc:3};',
                output: 'var a = {a:1, c:3};'
            });
        });
    });

    describe('lineBreak option', function() {
        describe('beforeComma value', function() {
            reportAndFix({
                name: 'illegal comma placement in multiline object declaration',
                rules: {disallowCommaBeforeLineBreak: {lineBreak: 'beforeComma'}},
                errors: 2,
                input: 'var a = {a:1,\nc:3};',
                output: 'var a = {a:1\n, c:3};'
            });
        });
    });
});
