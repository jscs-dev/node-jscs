var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-anonymous-function', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireAnonymousFunctions: true
        });
    });

    it('should not report on anonymous function declarations', function() {
        expect(checker.checkString('$("hi").click(function(){});')).to.have.no.errors();
    });

    it('should not report on anonymous function expressions', function() {
        expect(checker.checkString('var x = function(){};')).to.have.no.errors();
        expect(checker.checkString('var foo = {bar: function() {}};')).to.have.no.errors();
    });

    it('should report on named function declarations', function() {
        expect(checker.checkString('function named(){}'))
            .to.have.one.error.from('ruleName');
    });

    it('should report on named function expressions', function() {
        expect(checker.checkString('$("hi").click(function named(){});'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = function named(){};'))
            .to.have.one.error.from('ruleName');
    });
});
