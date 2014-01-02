var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/maximum-line-length', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ maximumLineLength: 7 });
    });

    it('should report lines longer than the maximum', function() {
        assert(checker.checkString('var xyz;').getErrorCount() === 1);
    });

    it('should not report lines equal to the maximum', function() {
        assert(checker.checkString('var xy;').isEmpty());
    });

    it('should not report lines shorter than the maximum', function() {
        assert(checker.checkString('var x;').isEmpty());
    });
});
