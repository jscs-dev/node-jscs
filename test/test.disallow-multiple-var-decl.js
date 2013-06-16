var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-var-decl', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report multiple var decl', function() {
        checker.configure({ disallow_multiple_var_decl: true });
        assert(checker.checkString('var x, y;').getErrorCount() === 1);
    });
    it('should not report single var decl', function() {
        checker.configure({ disallow_multiple_var_decl: true });
        assert(checker.checkString('var x;').isEmpty());
    });
    it('should not report separated var decl', function() {
        checker.configure({ disallow_multiple_var_decl: true });
        assert(checker.checkString('var x; var y;').isEmpty());
    });
});
