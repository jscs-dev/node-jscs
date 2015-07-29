var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-line-feed-at-file-end', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireLineFeedAtFileEnd: true });
    });

    it('should report no line feed at file end', function() {
        assert(checker.checkString('var x;').getErrorCount() === 1);
    });

    it('should report no line feed at file end if end with comment', function() {
        assert(checker.checkString('var x;\n//foo').getErrorCount() === 1);
    });

    it('should not report existing line feed at file end', function() {
        assert(checker.checkString('var x;\n').isEmpty());
    });

    it('should not report existing line feed at file end with preceeding comment', function() {
        assert(checker.checkString('var x;\n//foo\n').isEmpty());
    });

    it('should report on an IIFE with no line feed at EOF', function() {
        assert.equal(checker.checkString('(function() {\nconsole.log(\'Hello World\');\n})();').getErrorCount(), 1);
    });
});
