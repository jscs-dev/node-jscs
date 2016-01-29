var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a (){}'))
              .to.have.one.validation.error.from('disallowSpacesInNamedFunctionExpression');
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

        it('should not report missing space before round brace in method shorthand', function() {
            expect(checker.checkString('var x = { y() {} }')).to.have.no.errors();
        });

        it('should not report special "constructor" method #1607', function() {
            expect(checker.checkString('class test { constructor() {} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'illegal space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a (){}',
            output: 'var x = function a(){}'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a() {}'))
              .to.have.one.validation.error.from('disallowSpacesInNamedFunctionExpression');
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
            expect(checker.checkString('var x = function a (){}')).to.have.no.errors();
        });

        it('should not report space before curly brace in method shorthand', function() {
            expect(checker.checkString('var x = { y () {} }')).to.have.no.errors();
        });

        it('should not report special "constructor" method #1607', function() {
            expect(checker.checkString('class test { constructor () {} }')).to.have.no.errors();
        });

        reportAndFix({
            name: 'missing space before curly brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function a() {}',
            output: 'var x = function a(){}'
        });
    });
});
