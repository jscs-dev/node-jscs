var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterObjectKeys: true });
    });

    it('should report missing space after keys', function() {
        assert(checker.checkString('var x = { a : 1, b: 2 };').getErrorCount() === 1);
        assert(checker.checkString('var x = { abc: 1, b: 2 };').getErrorCount() === 2);
    });

    it('should not report space after keys', function() {
        assert(checker.checkString('var x = { a : 1, bcd : 2 };').isEmpty());
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a, b };').isEmpty());
        assert(checker.checkString('var x = {a, b};').isEmpty());
    });

    it('should report mixed shorthand and normal object propertis', function() {
        checker.configure({ esnext: true });
        assert.equal(checker.checkString('var x = { a:1, b };').getErrorCount(), 1);
    });

    it('should not report es6-methods. #1013', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a() { } };').isEmpty());
    });

    it('should not report es5 getters/setters #1037', function() {
        assert(checker.checkString('var x = { get a() { } };').isEmpty());
        assert(checker.checkString('var x = { set a(val) { } };').isEmpty());
    });
});
