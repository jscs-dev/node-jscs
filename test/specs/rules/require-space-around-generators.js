var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-around-generators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('both true', function() {
        var rules = {
            requireSpacesInGenerator: { beforeStar: true, afterStar: true },
            esnext: true
        };

        beforeEach(function() {
            checker.configure(rules);
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

        it('should not report missing spaces error', function() {
            expect(checker.checkString('var x = function * (){}')).to.have.no.errors();
        });

        it('should skip async functions', function() {
            expect(checker.checkString('var x = async function * (){}')).to.have.no.errors();
        });

        it('should skip async functions', function() {
            var testExp = checker.checkString('var x = async function *(){}');
            var reqTest = 'requireSpacesInGenerator';
            expect(testExp).to.have.one.validation.error.from(reqTest);
        });
    });
});
