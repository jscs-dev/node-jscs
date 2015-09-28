var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-function-declarations', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowFunctionDeclarations: true
        });
    });

    it('should report on function declarations', function() {
        expect(checker.checkString('function declared() { }'))
          .to.have.one.validation.error.from('disallowFunctionDeclarations');
    });

    it('should not report on anonymous function expressions', function() {
        expect(checker.checkString('var expressed = function (){};')).to.have.no.errors();
        expect(checker.checkString('var foo = {bar: function() {}};')).to.have.no.errors();
    });

    it('should not report on named function expressions', function() {
        expect(checker.checkString('$("hi").click(function named(){});')).to.have.no.errors();
        expect(checker.checkString('var x = function named(){};')).to.have.no.errors();
    });
});
