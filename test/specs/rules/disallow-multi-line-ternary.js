var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multi-line-ternary', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultiLineTernary: true });
    });

    it('should not allow ternary with test on it\'s own line', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1 : 2;').getErrorCount(), 1);
    });

    it('should not allow ternary with alternate on it\'s own line', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b) ? 1\n : 2;').getErrorCount(), 1);
    });

    it('should not allow ternary with separate lines for test, consequent and alterntative', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1\n : 2;').getErrorCount(), 2);
    });

    it('should allow single line ternary', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 0);
    });

    describe('incorrect configuration', function() {
        it('should not accept objects', function() {
            assert.throws(function() {
                    checker.configure({ disallowMultiLineTernary: {} });
                },
                assert.AssertionError
            );
        });
    });
});
