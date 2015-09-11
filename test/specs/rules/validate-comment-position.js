var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/validate-comment-position', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('accepts valid position', function() {
        var validPositions = [
            'above',
            'beside'
        ];

        validPositions.forEach(function(position) {
            assert.doesNotThrow(function() {
                checker.configure({ validateCommentPosition: { position: position }});
            });
        });
    });

    it('rejects invalid position', function() {
        var invalidPositions = [
            'beneath',
            'under',
            'perpendicular',
            true
        ];

        invalidPositions.forEach(function(position) {
            assert.throws(function() {
                checker.configure({ validateCommentPosition: { position: position }});
            }, assert.AssertionError);
        });
    });

    it('accepts valid exceptions', function() {
        assert.doesNotThrow(function() {
            checker.configure({ validateCommentPosition: { position: 'above', allExcept: ['pragma', 'linter'] }});
        });
    });

    it('rejects invalid exceptions', function() {
        var invalidExceptions = [
            [1, 2, 3],
            ['linter', 1, true]
        ];

        invalidExceptions.forEach(function(exception) {
            assert.throws(function() {
                checker.configure({ validateCommentPosition: { position: 'above', allExcept: exception }});
            }, assert.AssertionError);
        });
    });

    it('should not accept non-objects', function() {
        assert.throws(function() {
                checker.configure({ validateCommentPosition: 'true' });
            },
            assert.AssertionError
        );
    });

    describe('position value "above"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'above' }});
        });

        it('should report on a comment beside a statement', function() {
            assert.strictEqual(checker.checkString('1 + 1; // invalid comment').getErrorCount(), 1);
        });

        it('should not report on a comment above a statement', function() {
            assert.strictEqual(checker.checkString('// valid comment\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on block comments above a statement', function() {
            assert.strictEqual(checker.checkString('/* block comments are skipped */\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on block comments beside a statement', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* block comments are skipped */').getErrorCount(), 0);
        });

        it('should not report on eslint inline configurations', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint eqeqeq */').getErrorCount(), 0);
        });

        it('should not report on eslint-disable pragma', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint-disable */').getErrorCount(), 0);
        });

        it('should not report on eslint-enable pragma', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint-enable */').getErrorCount(), 0);
        });

        it('should not report eslint-disable-line pragma', function() {
            assert.strictEqual(checker.checkString('1 + 1; // eslint-disable-line').getErrorCount(), 0);
        });

        it('should not report on excepted global variables (eslint)', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* global MY_GLOBAL, ANOTHER */').getErrorCount(), 0);
        });

        it('should not report on jshint compatible jslint options', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* jslint vars: true */').getErrorCount(), 0);
        });

        it('should not report on excepted global variables (jshint)', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* globals MY_GLOBAL: true */').getErrorCount(), 0);
        });

        it('should not report on jshint `exported` directives', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* exported MY_GLOBAL, ANOTHER */').getErrorCount(), 0);
        });

        it('should not report on jshint `falls through` directives', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* falls through */').getErrorCount(), 0);
        });

        it('should report on comments beginning with words made up of partial keywords', function() {
            assert.strictEqual(checker.checkString('1 + 1; // globalization is a word').getErrorCount(), 1);
        });

        it('should report on comments that mention keywords, but are not valid pragmas', function() {
            assert.strictEqual(checker.checkString('1 + 1; // mentioning falls through').getErrorCount(), 1);
        });

        it('should not report on jshint line comment directives', function() {
            assert.strictEqual(checker.checkString('1 + 1; // jshint ignore:line').getErrorCount(), 0);
        });

        it('should not report on istanbul pragmas', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* istanbul ignore next */').getErrorCount(), 0);
        });
    });

    describe('position value "above" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'above', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report on comments that start with excepted keywords', function() {
            assert.strictEqual(checker.checkString('1 + 1; // linter excepted comment').getErrorCount(), 0);
        });
        it('should still report on comments beside statements after skipping excepted comments', function() {
            assert.strictEqual(checker.checkString('1 + 1; // linter\n2 + 2; // invalid comment').getErrorCount(), 1);
        });
    });

    describe('position value "beside"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'beside' }});
        });

        it('should report on comments above statements', function() {
            assert.strictEqual(checker.checkString('// invalid comment\n1 + 1;').getErrorCount(), 1);
        });

        it('should not report on comments beside statements', function() {
            assert.strictEqual(checker.checkString('1 + 1; // valid comment').getErrorCount(), 0);
        });

        it('should not report on inline jscs disable rules', function() {
            assert.strictEqual(checker.checkString('// jscs: disable\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on jscs enable rules', function() {
            assert.strictEqual(checker.checkString('// jscs: enable\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on block comments above statements', function() {
            assert.strictEqual(checker.checkString('/* block comments are skipped */\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on stacked block comments', function() {
            assert.strictEqual(checker.checkString('/*block comment*/\n/*block comment*/\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report on block comments beside statements', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* block comment are skipped*/').getErrorCount(), 0);
        });

        it('should not report on jshint directives beside statements', function() {
            assert.strictEqual(checker.checkString('1 + 1; // jshint strict: true').getErrorCount(), 0);
        });
    });

    describe('position value "beside" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { position: 'beside', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report on comments that are above statements that begin with excepted keywords', function() {
            assert.strictEqual(checker.checkString('// pragma valid comment\n1 + 1;').getErrorCount(), 0);
        });

        it('should still report on comments that are above statements that follow excepted comments', function() {
            assert.strictEqual(checker.checkString('// pragma\n// invalid\n1 + 1;').getErrorCount(), 1);
        });
    });

});
