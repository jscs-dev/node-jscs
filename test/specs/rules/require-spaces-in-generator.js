var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-in-generator', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('both true', function() {
        var rules = {
            requireSpacesInGenerator: { beforeStar: true, afterStar: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report missing space before and after the star with function declaration',
            rules: rules,
            errors: 2,
            input: 'function*asdf(){}',
            output: 'function * asdf(){}'
        });

        reportAndFix({
            name: 'should report missing space after the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function *asdf(){}',
            output: 'function * asdf(){}'
        });

        reportAndFix({
            name: 'should report missing space before the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function* asdf(){}',
            output: 'function * asdf(){}'
        });

        reportAndFix({
            name: 'should report missing space before and after the star',
            rules: rules,
            errors: 2,
            input: 'var x = function*(){}',
            output: 'var x = function * (){}'
        });

        reportAndFix({
            name: 'should report missing space after the star',
            rules: rules,
            errors: 1,
            input: 'var x = function *(){}',
            output: 'var x = function * (){}'
        });

        reportAndFix({
            name: 'should report missing space before the star',
            rules: rules,
            errors: 1,
            input: 'var x = function* (){}',
            output: 'var x = function * (){}'
        });

        reportAndFix({
            name: 'should report missing space before and after the star with named function',
            rules: rules,
            errors: 2,
            input: 'var x = function*asdf(){}',
            output: 'var x = function * asdf(){}'
        });

        reportAndFix({
            name: 'should report missing space after the star with named function',
            rules: rules,
            errors: 1,
            input: 'var x = function *asdf(){}',
            output: 'var x = function * asdf(){}'
        });

        reportAndFix({
            name: 'should report missing space before the star with named function',
            rules: rules,
            errors: 1,
            input: 'var x = function* asdf(){}',
            output: 'var x = function * asdf(){}'
        });

        // TODO: fix in CST
        reportAndFix({
            name: 'should report missing space after the star for the shorthand',
            rules: rules,
            skip: true,
            errors: 1,
            input: '({ *foo() {} });',
            output: '({ * foo() {} });'
        });

        it('should not report shorthand method', function() {
            expect(checker.checkString('({ * foo() {} })')).to.have.no.errors();
        });

        it('should not report missing spaces error', function() {
            expect(checker.checkString('var x = function * (){}')).to.have.no.errors();
        });

        it('should bail out if this is not a generator', function() {
            expect(checker.checkString('var x = function (){}')).to.have.no.errors();
        });

        it('should not report missing spaces error with named function', function() {
            expect(checker.checkString('var x = function * asdf(){}')).to.have.no.errors();
        });

        it('should not report missing spaces error with function declaration', function() {
            expect(checker.checkString('function * asdf(){}')).to.have.no.errors();
        });

        it('should not report missing spaces error with async function', function() {
            expect(checker.checkString('var x = async function * (){}')).to.have.no.errors();
        });

        it('should skip async functions with named function', function() {
            expect(checker.checkString('var x = async function * asdf(){}')).to.have.no.errors();
        });

        it('should report missing space after star for async function', function() {
            var testExp = checker.checkString('var x = async function *(){}');
            var reqTest = 'requireSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });

        it('should report missing space after star for named async function', function() {
            var testExp = checker.checkString('var x = async function *asdf(){}');
            var reqTest = 'requireSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });
    });
});
