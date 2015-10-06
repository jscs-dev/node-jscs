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
        errors: 2,
        input: 'var a,\nb;',
        output: 'var a\n, b;'
    });

    reportAndFix({
        name: 'illegal comma placement in multiline array declaration',
        rules: rules,
        errors: 2,
        input: 'var a = [1,\n2];',
        output: 'var a = [1\n, 2];'
    });

    reportAndFix({
        name: 'illegal comma placement in multiline object declaration',
        rules: rules,
        errors: 2,
        input: 'var a = {a:1,\nc:3};',
        output: 'var a = {a:1\n, c:3};'
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

    describe('options as object', function() {
        describe('allExcept as option', function() {
            describe('with value `function`', function() {
                beforeEach(function() {
                    checker.configure({disallowCommaBeforeLineBreak: {allExcept: ['function']}});
                });
                it('should not report objects with function values', function() {
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
                it('should report objects without function values', function() {
                    assert(
                        checker.checkString('var a = {a:1,\nc:3};').getErrorCount() === 2
                    );
                });

                it('should handle empty objects', function() {
                    assert(
                        checker.checkString('var x = {}\n, t = 2;').isEmpty()
                    );
                });
            });
        });
    });

    describe('incorrect configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            assert.throws(function() {
                    checker.configure({ disallowCommaBeforeLineBreak: {} });
                },
                assert.AssertionError
            );
        });
    });
});
