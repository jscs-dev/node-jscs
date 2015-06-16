var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-semicolon', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('single space before semicolon', function() {
        checker.configure({ requireSpaceBeforeSemicolon: true });

        assert(!checker.checkString(';;').isEmpty());
        assert(!checker.checkString('var a = 1;').isEmpty());
        assert(!checker.checkString('var a = 2  ;').isEmpty());
    });
});
