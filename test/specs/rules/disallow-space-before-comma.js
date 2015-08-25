var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('does not allow spaces before commas', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        assert(checker.checkString('var a ,b;').getErrorCount() === 1);
    });

    it('does allow commas with no spaces', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        assert(checker.checkString('var a,b;').isEmpty());
    });
});
