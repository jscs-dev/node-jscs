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

    it('should allow multi-line nested ternary', function() {
        assert.strictEqual(checker.checkString(
            'var foo = (a === b)\n' +
            '    ? (x > y)\n' +
            '        ? 1\n' +
            '        : 2\n' +
            '    : (c === d)\n' +
            '        ? 3\n' +
            '        : 4;'
        ).getErrorCount(), 0);
    });

    it('should report correct amount of errors for nesting single line ternaries in multi-line ternaries', function() {
        assert.strictEqual(checker.checkString(
            'var foo = (a === b)\n' +
            '    ? (x > y) ? 1 : 2\n' +
            '    : (c === d) ? 3 : 4;'
        ).getErrorCount(), 4);
    });

    it('should not allow single line ternary', function() {
        assert.strictEqual(checker.checkString('var foo = (a === b) ? 1 : 2;').getErrorCount(), 2);
    });

    it('should not allow single line nested ternary', function() {
        assert.strictEqual(checker.checkString(
            'var foo = (a === b) ? (x > y) ? 1 : 2 : (c === d) ? 3 : 4;'
        ).getErrorCount(), 6);
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
