var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-line-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultipleLineStrings: true });
    });

    it('should report multiple line strings', function() {
        assert(checker.checkString('x = " \\\n oops";').getErrorCount() === 1);
    });

    it('should not fix multiple line strings', function() {
        var input = 'x = " \\\n oops";';
        var result = checker.fixString(input);
        assert.equal(result.output, input);
        assert.equal(result.errors.getErrorCount(), 1);
    });

    it('should not report concatenated strings on multiple lines', function() {
        assert(checker.checkString('x = " " + \n " ok";').isEmpty());
    });

    it('should not report single line strings', function() {
        assert(checker.checkString('x = "ok"').isEmpty());
    });
});
