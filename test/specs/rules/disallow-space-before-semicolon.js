var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-semicolon', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('no spaces before semicolon', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        assert(!checker.checkString(' ; ;').isEmpty());
        assert(!checker.checkString('var a = 1 ;').isEmpty());
        assert(!checker.checkString('var a = 2  ;').isEmpty());
    });
});
