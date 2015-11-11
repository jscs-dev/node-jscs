var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeComma: true });
    });

    it('does not allow spaces before commas in var declaration', function() {
        expect(checker.checkString('var a ,b;')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does allow commas with spaces after in var delcaration', function() {
        expect(checker.checkString('var a, b, c;')).to.have.no.errors();
    });

    it('does not allow tabs before commas in var declaration', function() {
        expect(checker.checkString('var a\t,b;')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does allow commas with no spaces in var declaration', function() {
        expect(checker.checkString('var a,b;')).to.have.no.errors();
    });

    it('does allow commas with newline character before in var delcaration', function() {
        expect(checker.checkString('var a\n,b\n,c;')).to.have.no.errors();
    });

    it('does not allow spaces before commas in arrays', function() {
        expect(checker.checkString('[a ,b]')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does allow commas with spaces after in arrays', function() {
        expect(checker.checkString('[a, b, c]')).to.have.no.errors();
    });

    it('does not allow tabs before commas in arrays', function() {
        expect(checker.checkString('[a\t,b]')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does allow commas with no spaces in arrays', function() {
        expect(checker.checkString('[a,b]')).to.have.no.errors();
    });

    it('does allow commas with newline character before in arrays', function() {
        expect(checker.checkString('[a\n,b\n,c]')).to.have.no.errors();
    });

    it('does allow sparse arrays', function() {
        expect(checker.checkString('[a,,,b,c]')).to.have.no.errors();
    });

    it('does not allow spaces in sparse arrays', function() {
        expect(checker.checkString('[a, , ,b,c]')).to.have.error.count.equal(2);
    });

    it('does allow spaces in sparse arrays when excepted', function() {
        checker.configure({ disallowSpaceBeforeComma: {allExcept: ['sparseArrays']}});
        expect(checker.checkString('[a, , ,b,c]')).to.have.no.errors();
    });

    it('does allow spaces in sparse arrays when excepted but not after values', function() {
        checker.configure({ disallowSpaceBeforeComma: {allExcept: ['sparseArrays']}});
        expect(checker.checkString('[a , , , b , c]')).to.have.error.count.equal(2);
    });

    it('does not allow spaces before commas in objects', function() {
        expect(checker.checkString('var a = {x: 1 ,y: 2};')).to.have.one.validation.error();
    });

    it('does allow commas with spaces after in objects', function() {
        expect(checker.checkString('var a = {x: 1, y: 2};')).to.have.no.errors();
    });

    it('does not allow tabs before commas in objects', function() {
        expect(checker.checkString('var a = {x: 1\t,y: 2};')).to.have.one.validation.error();
    });

    it('does allow commas with no spaces in objects', function() {
        expect(checker.checkString('var a = {x: 1,y: 2};')).to.have.no.errors();
    });

    it('does allow commas with newline character before in objects', function() {
        expect(checker.checkString('var a = {x: 1\n,y: 2\n, z: 3};')).to.have.no.errors();
    });

});
