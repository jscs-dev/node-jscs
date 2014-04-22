var Checker = require('../../lib/modules/checker');
var assert = require('assert');

describe('rules/disallow-space-before-block-statements', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeBlockStatements: true });
    });

    it('should report missing space for control structures', function() {
        assert(checker.checkString('if (true) { var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('if (true)\n{ var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('if (true){ var a = false; }').getErrorCount() === 0);
    });

    it('should report missing space for loops', function() {
        assert(checker.checkString('while (true) { var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('while (true)\n{ var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('while (true){ var a = false; }').getErrorCount() === 0);
        assert(checker.checkString('for (var e in es) { var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('for (var e in es)\n{ var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('for (var e in es){ var a = false; }').getErrorCount() === 0);
    });

    it('should report missing space for function declarations', function() {
        assert(checker.checkString('function foo(i) { var a = false; }').getErrorCount() === 1);
        assert(checker.checkString('function foo(i){ var a = false; }').getErrorCount() === 0);
    });

    it('should not affect object decls', function() {
        assert(checker.checkString('var a ={};').getErrorCount() === 0);
        assert(checker.checkString('var a ={id:5};').getErrorCount() === 0);
        assert(checker.checkString('var a = {};').getErrorCount() === 0);
        assert(checker.checkString('var a = {id:5};').getErrorCount() === 0);
    });
});
