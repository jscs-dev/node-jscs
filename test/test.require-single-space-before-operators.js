var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-single-space-before-round-brace', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing single space before { option', function() {
        checker.configure({
            requireSingleSpaceBeforeOperators: {
                '{': [')']
            }
        });
        var test = 'if (x)  { x += 1; }';
        assert(checker.checkString(test).getErrorCount() === 1);
        assert(checker.checkString(test).getErrorList()[0].line === 1);
        assert(checker.checkString(test).getErrorList()[0].column === 9);
    });
    it('should not report missing single space before { option', function() {
        checker.configure({
            requireSingleSpaceBeforeOperators: {
                '{': [')']
            }
        });
        var test = 'if (x) { x += 1; }';
        assert(checker.checkString(test).isEmpty());
    });
    it('should report three missing single spaces before multiple options', function() {
        checker.configure({
            requireSingleSpaceBeforeOperators: {
                '{': [')', ':', '='],
                '(': ['if']
            }
        });
        var test = 'var test =  { ing:  {} }; if  (test.ing) { test.ing.done = true; }';
        assert(checker.checkString(test).getErrorCount() === 3);
    });
    it('should not report three missing single spaces before multiple options', function() {
        checker.configure({
            requireSingleSpaceBeforeOperators: {
                '{': [')', ':', '='],
                '(': ['if']
            }
        });
        var test = 'var test = { ing: {} }; if (test.ing) { test.ing.done = true; }';
        assert(checker.checkString(test).isEmpty());
    });
});
