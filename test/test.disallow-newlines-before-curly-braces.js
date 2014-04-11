var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-newlines-before-curly-braces', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report new line for )', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: [')'] });
        assert(checker.checkString('if (x)\n{ x += 1; }').getErrorCount() === 1);
    });
    it('should not report new line for )', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: [')'] });
        assert(checker.checkString('if (x) { x += 1; }').isEmpty());
    });
    it('should report new line for =', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: ['='] });
        assert(checker.checkString('var x =\n{\none: 1\n}').getErrorCount() === 1);
    });
    it('should not report new line for =', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: ['='] });
        assert(checker.checkString('var x = {\none: 1\n}').isEmpty());
    });
    it('should report new line for ) in function expression', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: [')'] });
        assert(checker.checkString('var x = function ()\n{ return true; }').getErrorCount() === 1);
    });
    it('should not report new line for ) in function expression', function() {
        checker.configure({ disallowNewlinesBeforeCurlyBraces: [')'] });
        assert(checker.checkString('var x = function () { return true; }').isEmpty());
    });
});
