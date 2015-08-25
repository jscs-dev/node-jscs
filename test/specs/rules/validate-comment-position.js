var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/validate-comment-position', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('accepts valid mode', function() {
        var validModes = [
            'above',
            'beside'
        ];

        validModes.forEach(function(mode) {
            assert.doesNotThrow(function() {
                checker.configure({ validateCommentPosition: mode });
            });
        });
    });

    it('rejects invalid mode', function() {
        var invalidModes = [
            'beneath',
            'under',
            'perpendicular',
            true
        ];

        invalidModes.forEach(function(mode) {
            assert.throws(function() {
                checker.configure({ validateCommentPosition: mode });
            }, assert.AssertionError);
        });
    });

    describe('mode value "above"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: 'above' });
        });

        it('should report unexpected position for 1 + 1; // invalid comment', function() {
            assert.strictEqual(checker.checkString('1 + 1; // invalid comment').getErrorCount(), 1);
        });

        it('should not report any errors for // valid comment<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// valid comment\n1 + 1;').getErrorCount(), 0);
        });
    });

    describe('mode value "beside"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: 'beside' });
        });

        it('should report unexpected position for // invalid comment<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// invalid comment\n1 + 1;').getErrorCount(), 1);
        });

        it('should not report any errors for 1 + 1; // valid comment', function() {
            assert.strictEqual(checker.checkString('1 + 1; // valid comment').getErrorCount(), 0);
        });

        it('should not report any errors for // jscs: disable<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// jscs: disable\n1 + 1;').getErrorCount(), 0);
        });
    });
});
