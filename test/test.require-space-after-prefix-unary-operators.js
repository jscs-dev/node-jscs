var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-prefix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report sticky operator', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        assert(checker.checkString('var x = ~0; ++x; -x; !++x;').getErrorCount() === 5);
    });
    it('should not report separated operator', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        assert(checker.checkString('var x = ~ 0; ++ x; - x; ! ++ x;').isEmpty());
    });
});
