var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-quoted-keys-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: true });
    });

    it('should report if key is valid without quotes', function() {
        assert(checker.checkString('var x = { "a": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "A": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "_abc": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "_a1": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "_abc_": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "a_a": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "12": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "$1": 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { "a$b": 1 }').getErrorCount() === 1);
    });

    it('should not report for keys without quotes', function() {
        assert(checker.checkString('var x = { a: 1 }').isEmpty());
        assert(checker.checkString('var x = { B: 1 }').isEmpty());
        assert(checker.checkString('var x = { _a: 1 }').isEmpty());
        assert(checker.checkString('var x = { _abc_: 1 }').isEmpty());
        assert(checker.checkString('var x = { _a1: 1 }').isEmpty());
        assert(checker.checkString('var x = { a_a: 1 }').isEmpty());
        assert(checker.checkString('var x = { 12: 1 }').isEmpty());
        assert(checker.checkString('var x = { $: 1 }').isEmpty());
        assert(checker.checkString('var x = { 0: 1 }').isEmpty());
    });

    it('should not report if key is invalid without quotes', function() {
        assert(checker.checkString('var x = { "": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a 1": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a  a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a-a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a+a": 1 }').isEmpty());
        assert(checker.checkString('var x = { ".": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a..a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a/a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "1a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "1$": 1 }').isEmpty());
        assert(checker.checkString('var x = { "010": 1 }').isEmpty());
    });

    it('should check all keys in object', function() {
        assert(checker.checkString('var x = { "a": 1, b: 2, "3": 3 }').getErrorCount() === 2);
    });

    it('should not report if reserved words when "allButReserved" mode is used', function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: 'allButReserved' });

        assert(checker.checkString('var x = { "default": 1, "class": "foo" }').isEmpty());
    });
});
