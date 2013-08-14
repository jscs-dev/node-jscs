var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-keywords', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });
    it('should not report space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });
    it('should not report space after keyword "function" for named function', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['function'] });
        assert(checker.checkString('function a(){}').isEmpty());
    });
    it('should report illegal after keyword "function" for anonymous function', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['function'] });
        assert(checker.checkString('a.map(function (){})').getErrorCount() === 1);
    });
    it('should not report space after keyword "function" for anonymous function', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['function'] });
        assert(checker.checkString('a.map(function(){})').isEmpty());
    });
});
