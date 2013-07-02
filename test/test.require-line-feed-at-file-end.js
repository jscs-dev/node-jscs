var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-line-feed-at-file-end', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report no line feed at file end', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        assert(checker.checkString('var x;').getErrorCount() === 1);
    });
    it('should not report existing line feed at file end', function() {
        checker.configure({ requireLineFeedAtFileEnd: true });
        assert(checker.checkString('var x;\n').isEmpty());
    });
});
