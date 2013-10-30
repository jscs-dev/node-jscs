var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-prefix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report separated operator', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        assert(checker.checkString('var x = ~ 0; ++ x; - x; ! ++ x;').getErrorCount() === 5);
    });
    it('should not report sticky operator', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        assert(checker.checkString('var x = ~0; ++x; -x; !++x;').isEmpty());
    });
});
