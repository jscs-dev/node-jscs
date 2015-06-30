var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-named-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a (){}'))
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
    });

    describe.skip('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInNamedFunctionExpression: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a() {}'))
            .to.have.one.error.from('ruleName');
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
    });
});
