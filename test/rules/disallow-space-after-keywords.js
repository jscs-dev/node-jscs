var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-keywords', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if (x) { x++; }').getErrorCount() === 1);
    });

    it('should not report space after keyword', function() {
        checker.configure({ disallowSpaceAfterKeywords: ['if'] });
        assert(checker.checkString('if(x) { x++; }').isEmpty());
    });

    it('should report on all possible ES3 keywords if a value of true is supplied', function() {
        checker.configure({ disallowSpaceAfterKeywords: true });

        assert(!checker.checkString('if (x) {}').isEmpty());
        assert(!checker.checkString('while (x) {}').isEmpty());
        assert(!checker.checkString('do {}').isEmpty());
    });
});
