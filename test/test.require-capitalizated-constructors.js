var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-capitalized-constructors', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCapitalizedConstructors: true });
    });

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
});
