var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space before keyword', function() {
        checker.configure({ requireSpaceBeforeKeywords: ['else'] });
        assert(checker.checkString('if (true) {\n}else { x++; }').getErrorCount() === 1);
    });
});
