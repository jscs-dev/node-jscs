var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-trailing-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowTrailingComma: true });
    });

    it('should report trailing comma in object literal', function() {
        assert(checker.checkString('var x = {a: "a", b: "b"}').getErrorCount() === 0);
        assert(checker.checkString('var x = {a: "a", b: "b"\n}').getErrorCount() === 0);
        assert(checker.checkString('var x = {a: "a", b: "b",}').getErrorCount() === 1);
        assert(checker.checkString('var x = {a: "a", b: "b",\n}').getErrorCount() === 1);
    });

    it('should report trailing comma in array', function() {
        assert(checker.checkString('var x = [1, 2]').getErrorCount() === 0);
        assert(checker.checkString('var x = [1, 2\n]').getErrorCount() === 0);
        assert(checker.checkString('var x = [1, 2,]').getErrorCount() === 1);
        assert(checker.checkString('var x = [1, 2,\n]').getErrorCount() === 1);
    });

    it('should report right location for trailing comma in object (#1018)', function() {
        var errs = checker.checkString('var obj = {\n    foo: "foo",\n};').getErrorList();
        assert.equal(errs[0].line + ':' + errs[0].column, '2:15');
    });

    it('should report right location for trailing comma in array (#1018)', function() {
        var errs = checker.checkString('var arr = [\n    \'foo\',\n];').getErrorList();
        assert.equal(errs[0].line + ':' + errs[0].column, '2:10');
    });

});
