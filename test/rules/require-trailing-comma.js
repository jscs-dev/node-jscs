var Checker = require('../../lib/modules/checker');
var assert = require('assert');

describe('rules/require-trailing-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireTrailingComma: true });
    });

    it('should allow object or array initialization without comma', function() {
        assert(checker.checkString('var x = {}').getErrorCount() === 0);
        assert(checker.checkString('var x = { }').getErrorCount() === 0);
        assert(checker.checkString('var x = []').getErrorCount() === 0);
        assert(checker.checkString('var x = [ ]').getErrorCount() === 0);
    });

    it('should report trailing comma required in object literal', function() {
        assert(checker.checkString('var x = {a: "a", b: "b",}').getErrorCount() === 0);
        assert(checker.checkString('var x = {a: "a", b: "b",\n}').getErrorCount() === 0);
        assert(checker.checkString('var x = {a: "a", b: "b"}').getErrorCount() === 1);
        assert(checker.checkString('var x = {a: "a", b: "b"\n}').getErrorCount() === 1);
    });

    it('should report trailing comma required in array', function() {
        assert(checker.checkString('var x = [1, 2,]').getErrorCount() === 0);
        assert(checker.checkString('var x = [1, 2,\n]').getErrorCount() === 0);
        assert(checker.checkString('var x = [1, 2]').getErrorCount() === 1);
        assert(checker.checkString('var x = [1, 2\n]').getErrorCount() === 1);
    });

});
