var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-after-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceAfterComma: true });
    });

    it('does not allow spaces after commas in var delarations', function() {
        expect(checker.checkString('var a, b;')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does not allow tabs after commas in var delarations', function() {
        expect(checker.checkString('var a,\tb;')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does allow commas with no spaces in var delarations', function() {
        expect(checker.checkString('var a,b,c;')).to.have.no.errors();
    });

    it('does allow commas with spaces before in var delarations', function() {
        expect(checker.checkString('var a ,b ,c;')).to.have.no.errors();
    });

    it('does allow commas with newline character after in var delarations', function() {
        expect(checker.checkString('var a,\nb,\nc;')).to.have.no.errors();
    });

    it('does not allow spaces after commas in arrays', function() {
        expect(checker.checkString('[a, b]')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does not allow tabs after commas in arrays', function() {
        expect(checker.checkString('[a,\tb]')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does allow commas with no spaces in arrays', function() {
        expect(checker.checkString('[a,b,c]')).to.have.no.errors();
    });

    it('does allow commas with spaces before in arrays', function() {
        expect(checker.checkString('[a ,b ,c]')).to.have.no.errors();
    });

    it('does allow commas with newline character after in arrays', function() {
        expect(checker.checkString('[a,\nb,\nc]')).to.have.no.errors();
    });

    it('does allow sparse arrays', function() {
        expect(checker.checkString('[a,,,b,c]')).to.have.no.errors();
    });

    it('does not allow spaces in sparse arrays', function() {
        expect(checker.checkString('[a, , ,b,c]')).to.have.error.count.equal(2);
    });

    it('does allow spaces in sparse arrays when excepted', function() {
        checker.configure({ disallowSpaceAfterComma: {allExcept: ['sparseArrays']}});
        expect(checker.checkString('[a, , ,b,c]')).to.have.no.errors();
    });

    it('does allow spaces in sparse arrays when excepted but not before values', function() {
        checker.configure({ disallowSpaceAfterComma: {allExcept: ['sparseArrays']}});
        expect(checker.checkString('[a, , , b, c]')).to.have.error.count.equal(2);
    });

    it('does not allow spaces after commas in objects', function() {
        expect(checker.checkString('var a = {x: 1, y: 2};')).to.have.one.validation.error();
    });

    it('does not allow tabs after commas in objects', function() {
        expect(checker.checkString('var a = {x: 1,\ty: 2};')).to.have.one.validation.error();
    });

    it('does allow commas with no spaces in objects', function() {
        expect(checker.checkString('var a = {x: 1,y: 2};')).to.have.no.errors();
    });

    it('does allow commas with spaces before in objects', function() {
        expect(checker.checkString('var a = {x: 1 ,y: 2};')).to.have.no.errors();
    });

    it('does allow commas with newline character after in objects', function() {
        expect(checker.checkString('var a = {x: 1,\ny: 2,\nz: 3};')).to.have.no.errors();
    });

});
