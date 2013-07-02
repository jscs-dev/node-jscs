var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal keyword', function() {
        checker.configure({ disallowKeywords: ['with'] });
        assert(checker.checkString('with (x) { y++; }').getErrorCount() === 1);
    });
    it('should not report legal keywords', function() {
        checker.configure({ disallowKeywords: ['with'] });
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });
});
