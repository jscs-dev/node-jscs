var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-after-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterComma: true });
    });

    it('should report error when no space is given', function() {
        expect(checker.checkString('var a,b;')).to.have.one.validation.error.from('requireSpaceAfterComma');
    });

    it('should report error when space is given before but not after comma', function() {
        expect(checker.checkString('var a ,b;')).to.have.one.validation.error.from('requireSpaceAfterComma');
    });

    it('should allow space after comma in var declaration', function() {
        expect(checker.checkString('var a, b;')).to.have.no.errors();
    });

    it('should allow space after and before comma in var declaration', function() {
        expect(checker.checkString('var a , b;')).to.have.no.errors();
    });

    it('should allow new line after comma in var declaration', function() {
        expect(checker.checkString('var a,\nb,\nc;')).to.have.no.errors();
    });

    it('should report errors when no space is given in arrays', function() {
        expect(checker.checkString('var a = [1,2,3,4];')).to.have.error.count.equal(3);
    });

    it('should report errors when space is given before but not after commas in arrays', function() {
        expect(checker.checkString('var a = [1 ,2 ,3 ,4];')).to.have.error.count.equal(3);
    });

    it('should allow space after comma in arrays', function() {
        expect(checker.checkString('var a = [1, 2, 3, 4];')).to.have.no.errors();
    });

    it('should allow space after and before comma in arrays', function() {
        expect(checker.checkString('var a = [1 , 2 , 3 , 4];')).to.have.no.errors();
    });

    it('should allow new line after comma in arrays', function() {
        expect(checker.checkString('var a = [1,\n2,\n3];')).to.have.no.errors();
    });

    it('should report errors when no space is given in objects', function() {
        expect(checker.checkString('var a = {x:1,y:2,z:3};')).to.have.error.count.equal(2);
    });

    it('should report errors when space is given before but not after commas in objects', function() {
        expect(checker.checkString('var a = {x:1 ,y:2 ,z:3};')).to.have.error.count.equal(2);
    });

    it('should allow space after comma in objects', function() {
        expect(checker.checkString('var a = {x: 1, y: 2, z: 3};')).to.have.no.errors();
    });

    it('should allow space after and before comma in objects', function() {
        expect(checker.checkString('var a = {x: 1 , y: 2 , z: 3};')).to.have.no.errors();
    });

    it('should allow new line after comma in objects', function() {
        expect(checker.checkString('var a = {x: 1,\ny: 2,\nz: 3};')).to.have.no.errors();
    });

});
