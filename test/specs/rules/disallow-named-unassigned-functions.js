var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-named-unassigned-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                disallowNamedUnassignedFunctions: true
            });
        });

        it('should not report on unnamed unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function(){});')).to.have.no.errors();
        });

        it('should report on named unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function named(){});'))
              .to.have.one.validation.error.from('disallowNamedUnassignedFunctions');
        });

        it('should not report on named function declarations', function() {
            expect(checker.checkString('function named(){};')).to.have.no.errors();
        });

        it('should not report on assigned function expressions', function() {
            expect(checker.checkString('var x = function(){};')).to.have.no.errors();
            expect(checker.checkString('var foo = {bar: function() {}};')).to.have.no.errors();
            expect(checker.checkString('foo.bar = function() {};')).to.have.no.errors();
            expect(checker.checkString('var x = function named(){};')).to.have.no.errors();
            expect(checker.checkString('var foo = {bar: function named() {}};')).to.have.no.errors();
            expect(checker.checkString('foo.bar = function named() {};')).to.have.no.errors();
        });
    });
});
