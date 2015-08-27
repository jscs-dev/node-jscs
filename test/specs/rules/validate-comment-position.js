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
                checker.configure({ validateCommentPosition: { mode: mode }});
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
                checker.configure({ validateCommentPosition: { mode: mode }});
            }, assert.AssertionError);
        });
    });

    it('accepts valid exceptions', function() {
        assert.doesNotThrow(function() {
            checker.configure({ validateCommentPosition: { mode: 'above', allExcept: ['pragma', 'linter'] }});
        });
    });

    it('rejects invalid exceptions', function() {
        var invalidExceptions = [
            [1, 2, 3],
            ['linter', 1, true]
        ];

        invalidExceptions.forEach(function(exception) {
            assert.throws(function() {
                checker.configure({ validateCommentPosition: { mode: 'above', allExcept: exception }});
            }, assert.AssertionError);
        });
    });

    describe('mode value "above"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { mode: 'above' }});
        });

        it('should report unexpected position for 1 + 1; // invalid comment', function() {
            assert.strictEqual(checker.checkString('1 + 1; // invalid comment').getErrorCount(), 1);
        });

        it('should not report any errors for // valid comment<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// valid comment\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report any errors for /* block comments are skipped */<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('/* block comments are skipped */\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* block comments are skipped */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* block comments are skipped */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* eslint eqeqeq */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint eqeqeq */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* eslint-disable */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint-disable */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* eslint-enable */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* eslint-enable */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; // eslint-disable-line', function() {
            assert.strictEqual(checker.checkString('1 + 1; // eslint-disable-line').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* global MY_GLOBAL, ANOTHER */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* global MY_GLOBAL, ANOTHER */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* jslint vars: true */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* jslint vars: true */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* globals MY_GLOBAL: true */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* globals MY_GLOBAL: true */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* exported MY_GLOBAL, ANOTHER */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* exported MY_GLOBAL, ANOTHER */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* falls through */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* falls through */').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; // jshint ignore:line', function() {
            assert.strictEqual(checker.checkString('1 + 1; // jshint ignore:line').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* istanbul ignore next */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* istanbul ignore next */').getErrorCount(), 0);
        });
    });

    describe('mode value "above" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { mode: 'above', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report unexpected position for 1 + 1; // linter excepted comment', function() {
            assert.strictEqual(checker.checkString('1 + 1; // linter excepted comment').getErrorCount(), 0);
        });
        it('should report unexpected position for 1 + 1; // linter<line-break>2 + 2; // invalid comment', function() {
            assert.strictEqual(checker.checkString('1 + 1; // linter\n2 + 2; // invalid comment').getErrorCount(), 1);
        });
    });

    describe('mode value "beside"', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { mode: 'beside' }});
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

        it('should not report any errors for // jscs: enable<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// jscs: enable\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report any errors for /* block comments are skipped */<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('/* block comments are skipped */\n1 + 1;').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; /* block comments are skipped */', function() {
            assert.strictEqual(checker.checkString('1 + 1; /* block comment are skipped*/').getErrorCount(), 0);
        });

        it('should not report any errors for 1 + 1; // jshint strict: true', function() {
            assert.strictEqual(checker.checkString('1 + 1; // jshint strict: true').getErrorCount(), 0);
        });
    });

    describe('mode value "beside" with exceptions', function() {
        beforeEach(function() {
            checker.configure({ validateCommentPosition: { mode: 'beside', allExcept: ['pragma', 'linter'] }});
        });

        it('should not report unexpected position for // pragma valid comment<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// pragma valid comment\n1 + 1;').getErrorCount(), 0);
        });

        it('should report unexpected position for // pragma<line-break>// invalid<line-break>1 + 1;', function() {
            assert.strictEqual(checker.checkString('// pragma\n// invalid\n1 + 1;').getErrorCount(), 1);
        });
    });

});
