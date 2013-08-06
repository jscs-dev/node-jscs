var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-left-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report sticky operator', function() {
        checker.configure({ disallowLeftStickedOperators: ['?'] });
        assert(checker.checkString('var x = y? z : w;').getErrorCount() === 1);
    });
    it('should not report separated operator', function() {
        checker.configure({ disallowLeftStickedOperators: ['?'] });
        assert(checker.checkString('var x = y ? z : w;').isEmpty());
    });
    it('should not report if sticked operator is part of argument', function() {
        checker.configure({ disallowLeftStickedOperators: ['-'] });
        assert(checker.checkString('arr.slice(-2)').isEmpty());
    });
});
