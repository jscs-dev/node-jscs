var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-spaces-in-function', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            disallowSpacesInFunction: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before round brace in Function', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report missing space before round brace in named Function', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in Function', function() {
            expect(checker.checkString('var x = function (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunction');
        });

        it('should report space before round brace in named Function', function() {
            expect(checker.checkString('var x = function a (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunction');
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc (){}'))
              .to.have.one.validation.error.from('disallowSpacesInFunction');
        });

        it('should not report space before round brace in getter', function() {
            expect(checker.checkString('var x = { get y () {} }')).to.have.no.errors();
        });

        it('should not report space before round brace in setter', function() {
            expect(checker.checkString('var x = { set y (v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in getter', function() {
            expect(checker.checkString('var x = { get y() {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in setter', function() {
            expect(checker.checkString('var x = { set y(v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before round brace in class method', function() {
            expect(checker.checkString('const Component = class { render() { return 1; } };')).to.have.no.errors();
        });

        it('should not report missing space before round brace in method shorthand #1470', function() {
            expect(checker.checkString('var x = { y() {} }')).to.have.no.errors();
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
            disallowSpacesInFunction: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report missing space before curly brace in Function', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in Function', function() {
            expect(checker.checkString('var x = function() {}'))
              .to.have.one.validation.error.from('disallowSpacesInFunction');
        });

        it('should not report space before curly brace in getter', function() {
            expect(checker.checkString('var x = { get y () {} }')).to.have.no.errors();
        });

        it('should not report space before curly brace in of setter', function() {
            expect(checker.checkString('var x = { set y (v) {} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in getter', function() {
            expect(checker.checkString('var x = { get y (){} }')).to.have.no.errors();
        });

        it('should not report missing space before curly brace in setter', function() {
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
