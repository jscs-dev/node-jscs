var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-multi-line-ternary', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireMultiLineTernary: true });
    });

    it('should allow multi line ternary', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b)\n ? 1\n : 2;').getErrorCount(), 0);
    });

    it('should not allow single line ternary', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 2);
    });

    describe('incorrect configuration', function() {
        it('should not accept objects', function() {
            assert.throws(function() {
                    checker.configure({ requireMultiLineTernary: {} });
                },
                assert.AssertionError
            );
        });
    });
});
