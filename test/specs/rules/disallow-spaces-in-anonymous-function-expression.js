var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-anonymous-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInAnonymousFunctionExpression: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function (){}'))
            .to.have.one.error.from('ruleName');
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

            expect(errors)
            .to.have.one.error.from('ruleName');
            assert(error.column === 16);
        });
    });

    describe.skip('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInAnonymousFunctionExpression: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report named FunctionExpression', function() {
            expect(checker.checkString('var x = function test() {}')).to.have.no.errors();
        });

        it('should report space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function() {}'))
            .to.have.one.error.from('ruleName');
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
    });
});
