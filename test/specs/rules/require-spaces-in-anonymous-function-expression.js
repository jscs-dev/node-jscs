var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-spaces-in-anonymous-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw if allExcept empty array', function() {
            expect(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: [] } });
            }).to.throw();
        });

        it('should throw if not allExcept array or true', function() {
            expect(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: {} } });
            }).to.throw();

            expect(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: false } });
            }).to.throw();
        });

        it('should throw if allExcept unrecognized', function() {
            expect(function() {
                checker.configure({ requireSpacesInAnonymousFunctionExpression: { allExcept: ['foo'] } });
            }).to.throw();
        });
    });

    describe('beforeOpeningRoundBrace', function() {
        var rules = {
            requireSpacesInAnonymousFunctionExpression: { beforeOpeningRoundBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}'))
              .to.have.one.validation.error.from('requireSpacesInAnonymousFunctionExpression');
        });

        it('should not report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function (){}')).to.have.no.errors();
        });

        it('should not report named FunctionExpression', function() {
            expect(checker.checkString('var x = function test() {}')).to.have.no.errors();
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
            name: 'missing space before round brace in FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = function(){}',
            output: 'var x = function (){}'
        });

        reportAndFix({
            name: 'missing space before round brace in async FunctionExpression',
            rules: rules,
            errors: 1,
            input: 'var x = async function(){}',
            output: 'var x = async function (){}'
        });
    });

    describe('beforeOpeningCurlyBrace', function() {
        var rules = {
            requireSpacesInAnonymousFunctionExpression: { beforeOpeningCurlyBrace: true }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        it('should report missing space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}'))
              .to.have.one.validation.error.from('requireSpacesInAnonymousFunctionExpression');
        });

        it('should not report space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function() {}')).to.have.no.errors();
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
            expect(checker.checkString('var x = function() {}')).to.have.no.errors();
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
            input: 'var x = function(){}',
            output: 'var x = function() {}'
        });
    });
});
