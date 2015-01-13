var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-in-for-statement', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInForStatement: true });
        });
        it('should report missing spaces in for statement in both cases', function() {
            assert(checker.checkString('for(i=0;i<l;i++){}').getErrorCount() === 2);
        });
        it('should report missing spaces in for statement before test statement', function() {
            assert(checker.checkString('for(i=0; i<l;i++){}').getErrorCount() === 1);
        });
        it('should report missing spaces in for statement behind test statement', function() {
            assert(checker.checkString('for(i=0;i<l; i++){}').getErrorCount() === 1);
        });
        it('should not report with spaces', function() {
            assert(checker.checkString('for(i=0; i<l; i++){}').isEmpty());
        });
        it('should report even without init', function() {
            assert(checker.checkString('for(;i<l; i++){}').getErrorCount() === 1);
        });
    });
});
