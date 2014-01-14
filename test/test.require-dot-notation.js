var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-dot-notation', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireDotNotation: true });
    });

    it('should report literal subscription', function() {
        assert(checker.checkString('var x = a[\'b\']').getErrorCount() === 1);
    });

    it('should not report literal subscription for reserved words', function() {
        assert(checker.checkString('var x = a[\'while\']').isEmpty());
        assert(checker.checkString('var x = a[null]').isEmpty());
        assert(checker.checkString('var x = a[true]').isEmpty());
        assert(checker.checkString('var x = a[false]').isEmpty());
        assert(checker.checkString('var x = a["null"]').isEmpty());
        assert(checker.checkString('var x = a["true"]').isEmpty());
        assert(checker.checkString('var x = a["false"]').isEmpty());
    });

    it('should not report number subscription', function() {
        assert(checker.checkString('var x = a[1]').isEmpty());
    });

    it('should not report variable subscription', function() {
        assert(checker.checkString('var x = a[c]').isEmpty());
    });

    it('should not report object property subscription', function() {
        assert(checker.checkString('var x = a[b.c]').isEmpty());
    });

    it('should not report dot notation', function() {
        assert(checker.checkString('var x = a.b').isEmpty());
    });

    it('should not report for string that can\'t be identifier', function() {
        assert(checker.checkString('x["a-b"]').isEmpty());
        assert(checker.checkString('x["a.b"]').isEmpty());
        assert(checker.checkString('x["a b"]').isEmpty());
        assert(checker.checkString('x["1a"]').isEmpty());
        assert(checker.checkString('x["*"]').isEmpty());
    });
});
