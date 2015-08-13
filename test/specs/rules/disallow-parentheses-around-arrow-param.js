var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-parentheses-around-arrow-param', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, disallowParenthesesAroundArrowParam: true });
    });

    it('should not report without parens', function() {
        assert(checker.checkString('[1, 2].map(x => x * x);').isEmpty());
    });

    it('should report with parens around a single parameter', function() {
        assert(checker.checkString('[1, 2].map((x) => x * x);').getErrorCount() === 1);
    });

    it('should not report with parens around multiple parameters', function() {
        assert(checker.checkString('[1, 2].map((x, y) => x * x);').isEmpty());
    });

    it('should not report with parens around a single parameter with a default', function() {
        assert(checker.checkString('const a = (x = 1) => x * x;').isEmpty());
    });

    it('should not report with parens around a multiple parameters with a default', function() {
        assert(checker.checkString('const a = (x = 1, y) => x * y;').isEmpty());
    });

    it('should not report with use of destructuring #1672', function() {
        assert(checker.checkString('let func = ({hoge}) => hoge').isEmpty());
    });

    it('should not report with multiple parameters and destructuring', function() {
        assert(checker.checkString('let func = (foo, {hoge}) => hoge').isEmpty());
    });
});
