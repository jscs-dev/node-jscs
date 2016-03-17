var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionExpression');
        });

        it('should report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionExpression');
        });

        it('should not report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = async function(){}')).to.have.no.errors();
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = async function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = async function (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionExpression');
        });

        it('should report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = async function a (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionExpression');
        });

        it('should not report space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc (){}')).to.have.no.errors();
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

        it('should not report missing space before round brace in method shorthand #1470', function() {
            expect(checker.checkString('var x = { y() {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in class method', function() {
            expect(checker.checkString('const Component = class { render() { return 1; } };')).to.have.no.errors();
        });

        reportAndFix({
            name: 'extra space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function (){}',
            output: 'var x = function(){}'
        });

    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            disallowSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function() {}'))
              .to.have.one.validation.error.from('disallowSpacesInFunctionExpression');
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

        it('should not report missing space before curly brace in method shorthand', function() {
            expect(checker.checkString('var x = { y(){} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'extra space before curly brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function() {}',
            output: 'var x = function(){}'
        });
    });
});
