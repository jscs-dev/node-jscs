var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeObjectValues: true });
    });

    it('should report with space after keys colons', function() {
        assert.equal(checker.checkString('var x = { a:1, b: 2 };').getErrorCount(), 1, 'one error is found');
        assert.equal(checker.checkString('var x = { abc : 1, b: 2 };').getErrorCount(), 2, 'two errors are found');
        assert.equal(
            checker.checkString('var x = { abc:(true), z: (function() { return _z > 0; }) };').getErrorCount(),
            1,
            'one error is found'
        );
        assert.equal(
            checker.checkString('var x = { abc : (true), b: ("1")};').getErrorCount(),
            2,
            'two errors are found'
        );
        assert.equal(
            checker.checkString('var x = { a: ((1 > 2) && 3)};').getErrorCount(),
            1,
            'one error is found'
        );
    });

    it('should not report with no space after keys colons and parenthesised expression in property value', function() {
        assert(checker.checkString('var x = { a:(1 > 2)};').isEmpty());
        assert(checker.checkString('var x = { 0x7f   :(y?(z ? 1: 2):(3)) };').isEmpty());
        assert(checker.checkString('var x = { a:((1 > 2) && 3)};').isEmpty());
        assert(checker.checkString('var x = { a     :((  1 > 2) && 3)};').isEmpty());
    });

    it('should not report with no space after keys colons', function() {
        assert(checker.checkString('var x = { a:1, bcd :2 };').isEmpty());
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a, b };').isEmpty());
        assert(checker.checkString('var x = {a, b};').isEmpty());
    });

    it('should report mixed shorthand and normal object properties', function() {
        checker.configure({ esnext: true });
        assert.equal(checker.checkString('var x = { a : 1, b };').getErrorCount(), 1);
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
