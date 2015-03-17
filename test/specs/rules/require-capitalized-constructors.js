var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-constructors', function() {
    var checker;

    function baseCases() {
        it('should report uncapitalized construction', function() {
            assert(checker.checkString('var x = new y();').getErrorCount() === 1);
        });

        it('should not report capitalized construction', function() {
            assert(checker.checkString('var x = new Y();').isEmpty());
        });

        it('should not report member expression construction', function() {
            assert(checker.checkString('var x = new ns.y();').isEmpty());
        });

        it('should not report construction with "this" keyword', function() {
            assert(checker.checkString('var x = new this();').isEmpty());
        });
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('with `true` value', function() {
        beforeEach(function() {
            checker.configure({ requireCapitalizedConstructors: true });
        });

        baseCases();
    });

    describe('with `allExcept` value', function() {
        beforeEach(function() {
            checker.configure({
                requireCapitalizedConstructors: {
                    allExcept: ['somethingNative']
                }
            });
        });

        baseCases();

        it('should not report exempted construction', function() {
            assert(checker.checkString('var x = new somethingNative();').isEmpty());
        });
    });
});
