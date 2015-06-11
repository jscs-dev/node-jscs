var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-spread', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireSpread: true });
    });

    it('should report use of apply when the first param === the object of the member expression', function() {
        assert(checker.checkString('g.apply(g, arguments);').getErrorCount() === 1);
    });

    it('should not report the use apply with only 1 argument', function() {
        assert(checker.checkString('g.apply(arguments);').isEmpty());
    });

    it('should not report the use of spread', function() {
        assert(checker.checkString('g(...args);').isEmpty());
    });
});
