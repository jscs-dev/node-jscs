var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-generator', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('{beforeStar: true}', function() {
        var rules = {
            disallowSpacesInGenerator: {beforeStar: true}
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report illegal space before the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function * asdf(){}',
            output: 'function* asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space before the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function *asdf(){}',
            output: 'function*asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space before the star with function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function * (){}',
            output: 'var x = function* (){}'
        });

        reportAndFix({
            name: 'should report illegal space before the star with function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function *(){}',
            output: 'var x = function*(){}'
        });

        reportAndFix({
            name: 'should report illegal space before the star with named function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function * asdf(){}',
            output: 'var x = function* asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space before the star with named function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function *asdf(){}',
            output: 'var x = function*asdf(){}'
        });

        it('should not report shorthand method', function() {
            expect(checker.checkString('({ * foo() {} });')).to.have.no.errors();
        });

        it('should not report illegal space error', function() {
            expect(checker.checkString('var x = function* (){}')).to.have.no.errors();
        });

        it('should bail out if this is not a generator', function() {
            expect(checker.checkString('var x = function (){}')).to.have.no.errors();
        });

        it('should not report illegal space error with named function expression', function() {
            expect(checker.checkString('var x = function* asdf(){}')).to.have.no.errors();
        });

        it('should not report illegal space error with async function', function() {
            expect(checker.checkString('var x = async function* (){}')).to.have.no.errors();
        });

        it('should skip async functions with named function', function() {
            expect(checker.checkString('var x = async function* asdf(){}')).to.have.no.errors();
        });

        it('should report illegal space before star for async function', function() {
            var testExp = checker.checkString('var x = async function *(){}');
            var reqTest = 'disallowSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });

        it('should report illegal space before star for named async function', function() {
            var testExp = checker.checkString('var x = async function *asdf(){}');
            var reqTest = 'disallowSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });
    });

    describe('{afterStar: true}', function() {
        var rules = {
            disallowSpacesInGenerator: {afterStar: true}
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'should report illegal space after the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function * asdf(){}',
            output: 'function *asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space after the star with function declaration',
            rules: rules,
            errors: 1,
            input: 'function* asdf(){}',
            output: 'function*asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space after the star with function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function * (){}',
            output: 'var x = function *(){}'
        });

        reportAndFix({
            name: 'should report illegal space after the star with function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function* (){}',
            output: 'var x = function*(){}'
        });

        reportAndFix({
            name: 'should report illegal space after the star with named function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function * asdf(){}',
            output: 'var x = function *asdf(){}'
        });

        reportAndFix({
            name: 'should report illegal space after the star with named function expression',
            rules: rules,
            errors: 1,
            input: 'var x = function* asdf(){}',
            output: 'var x = function*asdf(){}'
        });

        // TODO: fix in CST
        reportAndFix({
            name: 'should report illegal space after the star for the shorthand',
            rules: rules,
            errors: 1,
            skip: true,
            input: '({ * foo() {} });',
            output: '({ *foo() {} });'
        });

        it('should not report illegal space error', function() {
            expect(checker.checkString('var x = function *(){}')).to.have.no.errors();
        });

        it('should not report illegal space error with named function expression', function() {
            expect(checker.checkString('var x = function *asdf(){}')).to.have.no.errors();
        });

        it('should not report illegal space error with function delcaration', function() {
            expect(checker.checkString('function *asdf(){}')).to.have.no.errors();
        });

        it('should not report illegal space error with async function', function() {
            expect(checker.checkString('var x = async function *(){}')).to.have.no.errors();
        });

        it('should skip async functions with named function', function() {
            expect(checker.checkString('var x = async function *asdf(){}')).to.have.no.errors();
        });

        it('should report illegal space after star for async function', function() {
            var testExp = checker.checkString('var x = async function* (){}');
            var reqTest = 'disallowSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });

        it('should report illegal space after star for named async function', function() {
            var testExp = checker.checkString('var x = async function* asdf(){}');
            var reqTest = 'disallowSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });
    });
});
