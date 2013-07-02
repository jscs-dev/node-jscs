var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-left-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space before operator', function() {
        checker.configure({ requireLeftStickedOperators: ['?'] });
        assert(checker.checkString('var x = y ? z : w;').getErrorCount() === 1);
    });
    it('should not report sticky operator', function() {
        checker.configure({ requireLeftStickedOperators: ['?'] });
        assert(checker.checkString('var x = y? z : w;').isEmpty());
    });
});
