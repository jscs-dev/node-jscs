var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal space after keyword', function() {
        checker.configure({ disallow_space_after_keywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });
    it('should not report space after keyword', function() {
        checker.configure({ disallow_space_after_keywords: ['if'] });
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });
});
