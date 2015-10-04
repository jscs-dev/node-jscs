var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-anonymous-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowAnonymousFunctions: true
        });
    });

    it('should report on anonymous function declarations', function() {
        expect(checker.checkString('$("hi").click(function(){});'))
          .to.have.one.validation.error.from('disallowAnonymousFunctions');
    });

    it('should report on anonymous function expressions', function() {
        expect(checker.checkString('var x = function(){};'))
          .to.have.one.validation.error.from('disallowAnonymousFunctions');
        expect(checker.checkString('var foo = {bar: function() {}};'))
          .to.have.one.validation.error.from('disallowAnonymousFunctions');
    });

    it('should not report on named function declarations', function() {
        expect(checker.checkString('function named(){};')).to.have.no.errors();
    });

    it('should not report on named function expressions', function() {
        expect(checker.checkString('$("hi").click(function named(){});')).to.have.no.errors();
        expect(checker.checkString('var x = function named(){};')).to.have.no.errors();
    });
});
