var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-function-declarations', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireFunctionDeclarations: true
        });
    });

    it('should report on anonymous function expression declarations', function() {
        expect(checker.checkString('var anon = function() {};'))
          .to.have.one.validation.error.from('requireFunctionDeclarations');
    });

    it('should report on named function expression declarations', function() {
        expect(checker.checkString('var named = function named() {};'))
          .to.have.one.validation.error.from('requireFunctionDeclarations');
    });

    it('should report on anonymous function expression assignments', function() {
        expect(checker.checkString('var anon; anon = function() {};'))
          .to.have.one.validation.error.from('requireFunctionDeclarations');
    });

    it('should report on named function expression assignments', function() {
        expect(checker.checkString('var named; named = function named() {};'))
          .to.have.one.validation.error.from('requireFunctionDeclarations');
    });

    it('should ignore member expression assignments', function() {
        expect(checker.checkString('obj.a = function() {};')).to.have.no.errors();
    });

    it('should ignore IIFEs', function() {
        expect(checker.checkString('(function() { void 0; })();')).to.have.no.errors();
    });

    it('should ignore function expressions in object literals', function() {
        expect(checker.checkString('var foo = {bar: function() {}};')).to.have.no.errors();
    });

    it('should ignore function expressions in function calls', function() {
        expect(checker.checkString('onclick(function() {})')).to.have.no.errors();
    });
});
