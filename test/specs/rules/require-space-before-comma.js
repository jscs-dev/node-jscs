var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeComma: true });
    });

    it('should report error when no space is given', function() {
        expect(checker.checkString('var a,b;')).to.have.one.validation.error.from('requireSpaceBeforeComma');
    });

    it('should report error when space is given after but not before comma', function() {
        expect(checker.checkString('var a, b;')).to.have.one.validation.error.from('requireSpaceBeforeComma');
    });

    it('should allow space before comma in var declaration', function() {
        expect(checker.checkString('var a ,b;')).to.have.no.errors();
    });

    it('should allow tab before comma in var declaration', function() {
        expect(checker.checkString('var a\t,b;')).to.have.no.errors();
    });

    it('should allow space before and after comma in var declaration', function() {
        expect(checker.checkString('var a , b;')).to.have.no.errors();
    });

    it('should allow new line before comma in var declaration', function() {
        expect(checker.checkString('var a\n,b\n,c;')).to.have.no.errors();
    });

    it('should report errors when no space is given in arrays', function() {
        expect(checker.checkString('var a = [1,2,3,4];')).to.have.error.count.equal(3);
    });

    it('should report errors when space is given after but not before commas in arrays', function() {
        expect(checker.checkString('var a = [1, 2, 3, 4];')).to.have.error.count.equal(3);
    });

    it('should allow space before comma in arrays', function() {
        expect(checker.checkString('var a = [1 ,2 ,3 ,4];')).to.have.no.errors();
    });

    it('should allow tab before comma in arrays', function() {
        expect(checker.checkString('var a = [1\t,2\t,3\t,4];')).to.have.no.errors();
    });

    it('should allow space before and after comma in arrays', function() {
        expect(checker.checkString('var a = [1 , 2 , 3 , 4];')).to.have.no.errors();
    });

    it('should allow new line before comma in arrays', function() {
        expect(checker.checkString('var a = [1\n,2\n,3];')).to.have.no.errors();
    });

    it('should allow sparse arrays', function() {
        expect(checker.checkString('var a = [a , , ,b ,c];')).to.have.no.errors();
    });

    it('should report errors when no space is given in objects', function() {
        expect(checker.checkString('var a = {x:1,y:2,z:3};')).to.have.error.count.equal(2);
    });

    it('should report errors when space is given after but not before commas in objects', function() {
        expect(checker.checkString('var a = {x:1, y:2, z:3};')).to.have.error.count.equal(2);
    });

    it('should allow space before comma in objects', function() {
        expect(checker.checkString('var a = {x: 1 ,y: 2 ,z: 3};')).to.have.no.errors();
    });

    it('should allow tab before comma in objects', function() {
        expect(checker.checkString('var a = {x: 1\t,y: 2\t,z: 3};')).to.have.no.errors();
    });

    it('should allow space before and after comma in objects', function() {
        expect(checker.checkString('var a = {x: 1 , y: 2 , z: 3};')).to.have.no.errors();
    });

    it('should allow new line before comma in objects', function() {
        expect(checker.checkString('var a = {x: 1\n,y: 2\n,z: 3};')).to.have.no.errors();
    });

});
