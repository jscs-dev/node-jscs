var Checker = require('../lib/checker');
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

    it('should not report multiple line strings', function() {
        assert(checker.checkString('x = " \\\\n oops";').isEmpty());
    });

    it('should not report concatendated strings on multiple lines', function() {
        assert(checker.checkString('x = " " + \n " ok";').isEmpty());
    });

    it('should not report single line strings', function() {
        assert(checker.checkString('x = "ok"').isEmpty());
    });
});
