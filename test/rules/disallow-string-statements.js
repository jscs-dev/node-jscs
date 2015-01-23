var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-string-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowStringLiteralStatements: true });
    });

    it('should not report strict directive', function() {
        assert(checker.checkString('\'use strict\';').isEmpty());
    });

    it('should report a mis-spelled directive', function() {
        assert(checker.checkString('\'use-strict\';').getErrorCount() === 1);
    });
});
