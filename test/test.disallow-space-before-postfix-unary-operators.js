var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-postfix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report separated operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x ++; x --;').getErrorCount() === 2);
    });
    it('should not report sticky operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x++; x--;').isEmpty());
    });
});
