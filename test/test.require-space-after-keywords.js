var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if(x) { x++; }').getErrorCount() === 1);
    });
    it('should not report space after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').isEmpty());
    });
    it('should not report semicolon after keyword', function() {
        checker.configure({ requireSpaceAfterKeywords: ['return'] });
        assert(checker.checkString('var x = function () { return; }').isEmpty());
    });
});
