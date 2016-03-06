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

    describe('autofix', function() {
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
    });

    it('should not report legal comma placement in multiline var declaration', function() {
        expect(checker.checkString('var a\n,b;')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline array declaration', function() {
        expect(checker.checkString('var a = [1\n,2];')).to.have.no.errors();
    });

    it('should not report legal comma placement in multiline sparse array declaration', function() {
        expect(checker.checkString('var a = [1\n,\n,\n,2];')).to.have.no.errors();
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

    it('should not report comma placement in function declaration #1746', function() {
        expect(checker.checkString('function a(b, c) {\n  console.log(1)\n}')).to.have.no.errors();
    });

    describe('options as object', function() {
        describe('allExcept as option', function() {
            describe('with value `function`', function() {
                beforeEach(function() {
                    checker.configure({disallowCommaBeforeLineBreak: {allExcept: ['function']}});
                });

                it('should not report objects with function values', function() {
                    expect(checker.checkString(
                            'var x = {\n' +
                                'a : 1,\n' +
                                'foo : function() {},\n' +
                                'bcd : 2\n' +
                            '};'
                        )).to.have.no.errors();
                });

                it('should report objects without function values', function() {
                    expect(checker.checkString('var a = {a:1,\nc:3};')).to.have.error.count.equal(2);
                });

                it('should handle empty objects', function() {
                    expect(checker.checkString('var x = {}\n, t = 2;')).to.have.no.errors();
                });
            });
        });
    });

    describe('incorrect configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            expect(function() {
                    checker.configure({ disallowCommaBeforeLineBreak: {} });
                }).to.throw('AssertionError');
        });
    });
});
