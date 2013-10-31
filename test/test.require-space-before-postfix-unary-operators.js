var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-postfix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report sticky operator', function() {
        checker.configure({ requireSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x++; x--;').getErrorCount() === 2);
    });
    it('should not report separated operator', function() {
        checker.configure({ requireSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x ++; x --;').isEmpty());
    });
});
