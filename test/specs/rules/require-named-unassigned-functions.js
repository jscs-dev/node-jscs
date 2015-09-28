var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-named-unassigned-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                requireNamedUnassignedFunctions: true
            });
        });

        it('should report on unnamed unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function(){});'))
              .to.have.one.validation.error.from('requireNamedUnassignedFunctions');
        });

        it('should not report on named unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function named(){});')).to.have.no.errors();
        });

        it('should not report on function declarations', function() {
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

    describe('option value allExcept', function() {
        beforeEach(function() {
            checker.configure({
                requireNamedUnassignedFunctions: {
                    allExcept: ['it', 'it.skip', 'x.y.z', 'x[1]', 'x[0].z']
                }
            });
        });

        it('should report on unnamed unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function(){});'))
              .to.have.one.validation.error.from('requireNamedUnassignedFunctions');
        });

        it('should not report on named unassigned function expressions', function() {
            expect(checker.checkString('$("hi").click(function named(){});')).to.have.no.errors();
        });

        it('should not report on function declarations', function() {
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

        it('should not report on excepted unnamed unassigned function expressions', function() {
            expect(checker.checkString('it(function (){});')).to.have.no.errors();
            expect(checker.checkString('it.skip(function () {});')).to.have.no.errors();
            expect(checker.checkString('x.y.z(function () {});')).to.have.no.errors();
            expect(checker.checkString('x[1](function () {});')).to.have.no.errors();
            expect(checker.checkString('x[0].z(function () {});')).to.have.no.errors();
        });

        it('should not report on excepted unnamed unassigned using bracket notation', function() {
            expect(checker.checkString('it[\'skip\'](function () {});')).to.have.no.errors();
        });

        it('doesn\'t explode on literals/constructors', function() {
            expect(checker.checkString('[0].forEach(function () {});'))
              .to.have.one.validation.error.from('requireNamedUnassignedFunctions');
            expect(checker.checkString('(new Item()).forEach(function () {});'))
              .to.have.one.validation.error.from('requireNamedUnassignedFunctions');
        });
    });

    describe('option value allExcept bad array', function() {
        it('raises an assertion error', function() {
            try {
                checker.configure({
                    requireNamedUnassignedFunctions: {
                        allExcept: 'unexpected content'
                    }
                });
            } catch (err) {
                return;
            }
            throw new Error('`checker.configure` should have raised an error for an invalid type');
        });
    });
});
