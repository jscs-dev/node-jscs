var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-semicolon', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not accept a false value as an option', function() {
        assert.throws(function() {
            checker.configure({ disallowSpaceBeforeSemicolon: false });
        });
    });

    it('does not allow spaces before semicolons', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        assert(checker.checkString('; ;').getErrorCount() === 1);
        assert(checker.checkString('var a = 1 ;').getErrorCount() === 1);
        assert(checker.checkString('var a = 2  ;').getErrorCount() === 1);
    });

    it('does allow semicolons with no spaces', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        assert(checker.checkString('var a = 1;').isEmpty());
    });
});
