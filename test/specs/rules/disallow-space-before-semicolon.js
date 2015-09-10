var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-semicolon', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            assert.throws(function() {
                    checker.configure({ disallowSpaceBeforeSemicolon: {} });
                },
                assert.AssertionError
            );
        });

        it('should not accept non-boolean non-objects', function() {
            assert.throws(function() {
                    checker.configure({ disallowSpaceBeforeSemicolon: 'true' });
                },
                assert.AssertionError
            );
        });
    });

    it('does not allow spaces before semicolons', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        assert(checker.checkString('; ;').getErrorCount() === 1);
        assert(checker.checkString('var a = 1 ;').getErrorCount() === 1);
        assert(checker.checkString('var a = 2  ;').getErrorCount() === 1);
    });

    it('does allow semicolons with no spaces', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        assert(checker.checkString('var a = 1;').isEmpty());
    });

    it('should allow space after parentheses', function() {
        checker.configure({
            disallowSpaceBeforeSemicolon: {
                allExcept: ['(']
            }
        });

        assert(checker.checkString('for ( ; nodeIndex < nodesCount; ++nodeIndex ) {}').isEmpty());
    });

    it('should not trigger error if semicolon is first token', function() {
        checker.configure({
            disallowSpaceBeforeSemicolon: true
        });

        assert(checker.checkString(';').isEmpty());
    });
});
