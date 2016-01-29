var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            requireSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}'))
              .to.have.one.validation.error.from('requireSpacesInNamedFunctionExpression');
        });

        it('should not report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a (){}')).to.have.no.errors();
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

        it('should not report space before round brace in method shorthand #1470', function() {
            expect(checker.checkString('var x = { y () {} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'missing space before round brace in named FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a(){}',
            output: 'var x = function a (){}'
        });

        reportAndFix({
            name: 'missing space before round brace in named async FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = async function a(){}',
            output: 'var x = async function a (){}'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            requireSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}'))
              .to.have.one.validation.error.from('requireSpacesInNamedFunctionExpression');
        });

        it('should not report space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a() {}')).to.have.no.errors();
        });

        it('should not report space before curly brace in getter expression', function() {
            expect(checker.checkString('var x = { get y () {} }')).to.have.no.errors();
        });

        it('should not report space before curly brace in setter expression', function() {
            expect(checker.checkString('var x = { set y (v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in getter expression', function() {
            expect(checker.checkString('var x = { get y (){} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in setter expression', function() {
            expect(checker.checkString('var x = { set y (v){} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace without option', function() {
            expect(checker.checkString('var x = function a() {}')).to.have.no.errors();
        });

        it('should not report space before curly brace in method shorthand', function() {
            expect(checker.checkString('var x = { y () {} }')).to.have.no.errors();
        });

        it('should not report special "constructor" method #1607', function() {
            expect(checker.checkString('class test { constructor () {} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'missing space before curly brace in named FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a(){}',
            output: 'var x = function a() {}'
        });
    });
});
