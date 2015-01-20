var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-variable-names', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowVariableNames: ['temp', 'foo'] });
    });
    it('should report illegal variable names', function() {
        assert(checker.checkString('temp = 1;').getErrorCount() === 1);
        assert(checker.checkString('obj[foo] = 1;').getErrorCount() === 1);
    });
    it('should not report legal variable names', function() {
        assert(checker.checkString('good = 1').isEmpty());
    });
});
