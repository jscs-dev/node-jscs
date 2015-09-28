var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-anonymous-function', function() {
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
          .to.have.one.validation.error.from('requireAnonymousFunctions');
    });

    it('should report on named function expressions', function() {
        expect(checker.checkString('$("hi").click(function named(){});'))
          .to.have.one.validation.error.from('requireAnonymousFunctions');
        expect(checker.checkString('var x = function named(){};'))
          .to.have.one.validation.error.from('requireAnonymousFunctions');
    });

    describe('allExcept: ["declarations"]', function() {
        beforeEach(function() {
            checker.configure({ requireAnonymousFunctions: { allExcept: ['declarations'] } });
        });

        it('should not report on named function declarations', function() {
            expect(checker.checkString('function foo(){}')).to.have.no.errors();
        });

        it('should report on named function expressions', function() {
            expect(checker.checkString('var foo = function bar(){};'))
              .to.have.one.validation.error.from('requireAnonymousFunctions');
        });
    });
});
