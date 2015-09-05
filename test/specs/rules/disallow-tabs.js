var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-tabs', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowTabs: true });
    });

    it('should report tab', function() {
        assert.equal(checker.checkString('\tvar foo;').getErrorCount(), 1);
    });

    it('should report tab in comment', function() {
        assert.equal(checker.checkString('\t// a comment').getErrorCount(), 1);
    });

    it('should report tab at end of line', function() {
        assert.equal(checker.checkString('var foo;\t').getErrorCount(), 1);
    });

    it('should not report tab', function() {
        assert(checker.checkString('var foo;').isEmpty());
    });
});
