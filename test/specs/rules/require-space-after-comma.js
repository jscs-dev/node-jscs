var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterComma: true });
    });

    it('should report error when no space is given', function() {
        assert(checker.checkString('var a,b;').getErrorCount() === 1);
    });

    it('should report error when space is given before but not after comma', function() {
        assert(checker.checkString('var a ,b;').getErrorCount() === 1);
    });

    it('should allow space after comma in var declaration', function() {
        assert(checker.checkString('var a, b;').isEmpty());
    });

    it('should allow space after and before comma in var declaration', function() {
        assert(checker.checkString('var a , b;').isEmpty());
    });

    it('should allow new line after comma in var declaration', function() {
        assert(checker.checkString('var a,\nb,\nc;').isEmpty());
    });

    it('should report errors when no space is given in arrays', function() {
        assert(checker.checkString('var a = [1,2,3,4];').getErrorCount() === 3);
    });

    it('should report errors when space is given before but not after commas in arrays', function() {
        assert(checker.checkString('var a = [1 ,2 ,3 ,4];').getErrorCount() === 3);
    });

    it('should allow space after comma in arrays', function() {
        assert(checker.checkString('var a = [1, 2, 3, 4];').isEmpty());
    });

    it('should allow space after and before comma in arrays', function() {
        assert(checker.checkString('var a = [1 , 2 , 3 , 4];').isEmpty());
    });

    it('should allow new line after comma in arrays', function() {
        assert(checker.checkString('var a = [1,\n2,\n3];').isEmpty());
    });

    it('should report errors when no space is given in objects', function() {
        assert(checker.checkString('var a = {x:1,y:2,z:3};').getErrorCount() === 2);
    });

    it('should report errors when space is given before but not after commas in objects', function() {
        assert(checker.checkString('var a = {x:1 ,y:2 ,z:3};').getErrorCount() === 2);
    });

    it('should allow space after comma in objects', function() {
        assert(checker.checkString('var a = {x: 1, y: 2, z: 3};').isEmpty());
    });

    it('should allow space after and before comma in objects', function() {
        assert(checker.checkString('var a = {x: 1 , y: 2 , z: 3};').isEmpty());
    });

    it('should allow new line after comma in objects', function() {
        assert(checker.checkString('var a = {x: 1,\ny: 2,\nz: 3};').isEmpty());
    });

});
