var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-anonymous-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInAnonymousFunctionExpression: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function (){}'))
              .to.have.one.validation.error.from('disallowSpacesInAnonymousFunctionExpression');
        });

        it('should not report space before round brace in getter expression', function() {
            expect(checker.checkString('var x = { get y () {} }')).to.have.no.errors();
        });

        it('should not report space before round brace in setter expression', function() {
            expect(checker.checkString('var x = { set y (v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in getter expression', function() {
            expect(checker.checkString('var x = { get y() {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in setter expression', function() {
            expect(checker.checkString('var x = { set y(v) {} }')).to.have.no.errors();
        });

        it('should set correct pointer', function() {
            var errors = checker.checkString('var x = function (){}');
            var error = errors.getErrorList()[0];

            expect(errors).to.have.one.validation.error.from('disallowSpacesInAnonymousFunctionExpression');
            expect(error.column).to.equal(16);
        });

        it('should not report special "constructor" method #1607', function() {
            expect(checker.checkString('class test { constructor() {} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'illegal space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function (){}',
            output: 'var x = function(){}'
        });

    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            disallowSpacesInAnonymousFunctionExpression: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report named FunctionExpression', function() {
            expect(checker.checkString('var x = function test() {}')).to.have.no.errors();
        });

        it('should report space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function() {}'))
              .to.have.one.validation.error.from('disallowSpacesInAnonymousFunctionExpression');
        });

        it('should not report space before curly brace in getter expression', function() {
            expect(checker.checkString('var x = { get y () {} }')).to.have.no.errors();
        });

        it('should not report space before curly brace in of setter expression', function() {
            expect(checker.checkString('var x = { set y (v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in getter expression', function() {
            expect(checker.checkString('var x = { get y (){} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in setter expression', function() {
            expect(checker.checkString('var x = { set y (v){} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace without option', function() {
            expect(checker.checkString('var x = function (){}')).to.have.no.errors();
        });

        reportAndFix({
            name: 'illegal space before curly brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function() {}',
            output: 'var x = function(){}'
        });
    });
});
