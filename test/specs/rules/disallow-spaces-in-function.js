var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-spaces-in-function', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('beforeOpeningRoundBrace', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInFunction: { beforeOpeningRoundBrace: true } });
        });

        it('should not report missing space before round brace in Function', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should not report missing space before round brace in named Function', function() {
            expect(checker.checkString('var x = function a(){}')).to.have.no.errors();
        });

        it('should report space before round brace in Function', function() {
            expect(checker.checkString('var x = function (){}'))
            .to.have.one.error.from('ruleName');
        });

        it('should report space before round brace in named Function', function() {
            expect(checker.checkString('var x = function a (){}'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report missing space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc(){}')).to.have.no.errors();
        });

        it('should report space before round brace in FunctionDeclaration', function() {
            expect(checker.checkString('function abc (){}'))
            .to.have.one.error.from('ruleName');
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
            checker.configure({ disallowSpacesInFunction: { beforeOpeningCurlyBrace: true } });
        });

        it('should not report missing space before curly brace in Function', function() {
            expect(checker.checkString('var x = function(){}')).to.have.no.errors();
        });

        it('should report space before curly brace in Function', function() {
            expect(checker.checkString('var x = function() {}'))
            .to.have.one.error.from('ruleName');
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
    });
});
