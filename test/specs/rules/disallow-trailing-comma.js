var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-trailing-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowTrailingComma: true });
    });

    it('should report trailing comma in object literal', function() {
        assert(checker.checkString('var x = {a: "a", b: "b"}').getValidationErrorCount() === 0);
        assert(checker.checkString('var x = {a: "a", b: "b"\n}').getValidationErrorCount() === 0);
        expect(checker.checkString('var x = {a: "a", b: "b",}'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = {a: "a", b: "b",\n}'))
            .to.have.one.error.from('ruleName');
    });

    it('should report trailing comma in array', function() {
        assert(checker.checkString('var x = [1, 2]').getValidationErrorCount() === 0);
        assert(checker.checkString('var x = [1, 2\n]').getValidationErrorCount() === 0);
        expect(checker.checkString('var x = [1, 2,]'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = [1, 2,\n]'))
            .to.have.one.error.from('ruleName');
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
