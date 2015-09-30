var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeComma: true });
    });

    it('should report error when no space is given', function() {
        assert(checker.checkString('var a,b;').getErrorCount() === 1);
    });

    it('should report error when space is given after but not before comma', function() {
        assert(checker.checkString('var a, b;').getErrorCount() === 1);
    });

    it('should allow space before comma in var declaration', function() {
        assert(checker.checkString('var a ,b;').isEmpty());
    });

    it('should allow space before and after comma in var declaration', function() {
        assert(checker.checkString('var a , b;').isEmpty());
    });

    it('should allow new line before comma in var declaration', function() {
        assert(checker.checkString('var a\n,b\n,c;').isEmpty());
    });

    it('should report errors when no space is given in arrays', function() {
        assert(checker.checkString('var a = [1,2,3,4];').getErrorCount() === 3);
    });

    it('should report errors when space is given after but not before commas in arrays', function() {
        assert(checker.checkString('var a = [1, 2, 3, 4];').getErrorCount() === 3);
    });

    it('should allow space before comma in arrays', function() {
        assert(checker.checkString('var a = [1 ,2 ,3 ,4];').isEmpty());
    });

    it('should allow space before and after comma in arrays', function() {
        assert(checker.checkString('var a = [1 , 2 , 3 , 4];').isEmpty());
    });

    it('should allow new line before comma in arrays', function() {
        assert(checker.checkString('var a = [1\n,2\n,3];').isEmpty());
    });

    it('should report errors when no space is given in objects', function() {
        assert(checker.checkString('var a = {x:1,y:2,z:3};').getErrorCount() === 2);
    });

    it('should report errors when space is given after but not before commas in objects', function() {
        assert(checker.checkString('var a = {x:1, y:2, z:3};').getErrorCount() === 2);
    });

    it('should allow space before comma in objects', function() {
        assert(checker.checkString('var a = {x: 1 ,y: 2 ,z: 3};').isEmpty());
    });

    it('should allow space before and after comma in objects', function() {
        assert(checker.checkString('var a = {x: 1 , y: 2 , z: 3};').isEmpty());
    });

    it('should allow new line before comma in objects', function() {
        assert(checker.checkString('var a = {x: 1\n,y: 2\n,z: 3};').isEmpty());
    });

});
