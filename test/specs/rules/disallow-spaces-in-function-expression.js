var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-function-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report missing space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function (){}'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space before round brace in named FunctionExpression', function() {
            expect(checker.checkString('var x = function a (){}'))
            .to.have.one.error.from('ruleName');
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

        it('should report space before round brace in class method', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('const Component = class { render () { return 1; } };'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report missing space before round brace in class method', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('const Component = class { render() { return 1; } };')).to.have.no.errors();
        });
    });

    describe.skip('beforeOpeningCurlyBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunctionExpression: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in FunctionExpression', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
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
