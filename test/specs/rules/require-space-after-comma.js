var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-after-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {

        beforeEach(function() {
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

        it('should allow tab after comma in var declaration', function() {
            expect(checker.checkString('var a,\tb;')).to.have.no.errors();
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

        it('should allow tab after comma in arrays', function() {
            expect(checker.checkString('var a = [1,\t2,\t3,\t4];')).to.have.no.errors();
        });

        it('should allow space after and before comma in arrays', function() {
            expect(checker.checkString('var a = [1 , 2 , 3 , 4];')).to.have.no.errors();
        });

        it('should report error when no space is given after trailing comma in array', function() {
            expect(checker.checkString('var a = [1, 2, 3, 4,];')).to.have.error.count.equal(1);
        });

        it('should allow new line after comma in arrays', function() {
            expect(checker.checkString('var a = [1,\n2,\n3];')).to.have.no.errors();
        });

        it('should allow sparse arrays', function() {
            expect(checker.checkString('[1, , , 2, 3];')).to.have.no.errors();
        });

        it('should report errors when no space is given in objects', function() {
            expect(checker.checkString('var a = {x:1,y:2,z:3};')).to.have.error.count.equal(2);
        });

        it('should report error when no space is given after trailing comma in object', function() {
            expect(checker.checkString('var a = {x:1, y:2, z:3,};')).to.have.error.count.equal(1);
        });

        it('should report errors when space is given before but not after commas in objects', function() {
            expect(checker.checkString('var a = {x:1 ,y:2 ,z:3};')).to.have.error.count.equal(2);
        });

        it('should allow space after comma in objects', function() {
            expect(checker.checkString('var a = {x: 1, y: 2, z: 3};')).to.have.no.errors();
        });

        it('should allow tab after comma in objects', function() {
            expect(checker.checkString('var a = {x: 1,\ty: 2,\tz: 3};')).to.have.no.errors();
        });

        it('should allow space after and before comma in objects', function() {
            expect(checker.checkString('var a = {x: 1 , y: 2 , z: 3};')).to.have.no.errors();
        });

        it('should allow new line after comma in objects', function() {
            expect(checker.checkString('var a = {x: 1,\ny: 2,\nz: 3};')).to.have.no.errors();
        });

        it('should report errors when no space is given after trailing comma in object in array', function() {
            expect(checker.checkString('var a = [{a:1, b:2,}, {c:3, d:4,},];')).to.have.error.count.equal(3);
        });

    });

    describe('option value "exceptTrailingCommas"', function() {

        beforeEach(function() {
            checker.configure({ requireSpaceAfterComma: { allExcept: ['trailing'] } });
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

        it('should allow space after trailing comma in arrays', function() {
            expect(checker.checkString('var a = [1, 2, 3, 4, ];')).to.have.no.errors();
        });

        it('should allow no space after trailing comma in arrays', function() {
            expect(checker.checkString('var a = [1, 2, 3, 4,];')).to.have.no.errors();
        });

        it('should allow new line after comma in arrays', function() {
            expect(checker.checkString('var a = [1,\n2,\n3];')).to.have.no.errors();
        });

        it('should report errors when no space is given in objects', function() {
            expect(checker.checkString('var a = {x:1,y:2,z:3};')).to.have.error.count.equal(2);
        });

        it('should allow when no space is given after trailing comma in object', function() {
            expect(checker.checkString('var a = {x:1, y:2, z:3,};')).to.have.no.errors();
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

        it('should allow when no space is given after trailing comma in object in array', function() {
            expect(checker.checkString('var a = [{a:1, b:2,}, {c:3, d:4,},];')).to.have.no.errors();
        });

    });

    describe('incorrect configuration', function() {

        it('should not accept options without a valid key', function() {
            expect(function() {
                checker.configure({ requireSpaceAfterComma: {} });
            }).to.throw('AssertionError');
        });

    });
});
