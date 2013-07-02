var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-multiple-var-decl', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report consecutive var decl', function() {
        checker.configure({ requireMultipleVarDecl: true });
        assert(checker.checkString('var x; var y;').getErrorCount() === 1);
    });
    it('should not report multiple var decl', function() {
        checker.configure({ requireMultipleVarDecl: true });
        assert(checker.checkString('var x, y;').isEmpty());
    });
    it('should not report separated var decl', function() {
        checker.configure({ requireMultipleVarDecl: true });
        assert(checker.checkString('var x; x++; var y;').isEmpty());
    });
});
