var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-quoted-keys-in-objects', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireQuotedKeysInObjects: true });
    });

    it('should report for object keys without quotes', function() {
        assert(checker.checkString('var x = { a: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { B: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { _a: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { _abc_: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { _a1: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { a_a: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { 12: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { $: 1 }').getErrorCount() === 1);
        assert(checker.checkString('var x = { 0: 1 }').getErrorCount() === 1);
    });

    it('should not report if the key is surrounded by quotes', function() {
        assert(checker.checkString('var x = { "a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "A": 1 }').isEmpty());
        assert(checker.checkString('var x = { "_abc": 1 }').isEmpty());
        assert(checker.checkString('var x = { "_a1": 1 }').isEmpty());
        assert(checker.checkString('var x = { "_abc_": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a_a": 1 }').isEmpty());
        assert(checker.checkString('var x = { "12": 1 }').isEmpty());
        assert(checker.checkString('var x = { "$1": 1 }').isEmpty());
        assert(checker.checkString('var x = { "a$b": 1 }').isEmpty());
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
        assert(checker.checkString('var x = { "6b2ea258-cf24-44fe-b857-c4e37e105d6f": 1 }').isEmpty());
        assert(checker.checkString('var x = { "default": 1, "class": "foo" }').isEmpty());
        assert(checker.checkString('var x = { "null": 1, "undefined": "foo" }').isEmpty());
    });

    it('should check all keys in object', function() {
        assert(checker.checkString('var x = { a: 1, "b": 2, c: 3 }').getErrorCount() === 2);
    });

    it('should correctly identify the error', function() {
        var errors = checker.checkString('var x = { a: 1 }');
        assert(errors.getErrorCount() === 1);

        var error = errors.getErrorList()[0];
        assert(error.message === 'Object key without surrounding quotes');
        assert(error.line === 1);
        assert(error.column === 10);
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a, b };').isEmpty());
    });

    it('should not report es6-methods. #1013', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a() { } };').isEmpty());
    });

    it('should not report es7 object spread. Ref #1624', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { ...a };').isEmpty());
    });

    it('should not report es5 getters/setters #1037', function() {
        assert(checker.checkString('var x = { get a() { } };').isEmpty());
        assert(checker.checkString('var x = { set a(val) { } };').isEmpty());
    });
});
