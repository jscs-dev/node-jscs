var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/space-after-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal space after keyword', function() {
        checker.configure({ spaceAfterKeywords: { 'disallowed': ['if'] }});
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });
    it('should not report space after keyword', function() {
        checker.configure({ spaceAfterKeywords: { 'disallowed': ['if'] }});
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });

    it('should report missing space after keyword', function() {
        checker.configure({ spaceAfterKeywords: { 'required': ['if'] }});
        assert(checker.checkString('if(x) { x++; }').getErrorCount() === 1);
    });
    it('should not report space after keyword', function() {
        checker.configure({ spaceAfterKeywords: { 'required': ['if'] }});
        assert(checker.checkString('if (x) { x++; }').isEmpty());
    });
    it('should not report semicolon after keyword', function() {
        checker.configure({ spaceAfterKeywords: { 'required': ['return'] }});
        assert(checker.checkString('var x = function () { return; }').isEmpty());
    });
});
