var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-parentheses-around-arrow-param', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, disallowParenthesesAroundArrowParam: true });
    });

    it('should not report an arrow function expression without parens', function() {
        assert(checker.checkString('[1, 2].map(x => x * x);').isEmpty());
    });

    it('should report an arrow function expression with parens around a single parameter', function() {
        assert(checker.checkString('[1, 2].map((x) => x * x);').getErrorCount() === 1);
    });

    it('should not report an arrow function expression with parens around multiple parameters', function() {
        assert(checker.checkString('[1, 2].map((x, y) => x * x);').isEmpty());
    });
});
