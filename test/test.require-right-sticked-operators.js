var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-right-sticked-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report missing space after operator', function() {
        checker.configure({ requireRightStickedOperators: ['!'] });
        assert(checker.checkString('var x = ! y;').getErrorCount() === 1);
    });
    it('should not report sticky operator', function() {
        checker.configure({ requireRightStickedOperators: ['!'] });
        assert(checker.checkString('var x = !y;').isEmpty());
    });
});
