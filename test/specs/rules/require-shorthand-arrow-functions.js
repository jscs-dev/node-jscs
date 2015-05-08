var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-shorthand-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireShorthandArrowFunctions: true });
    });

    it('should report a shorthand arrow function expression', function() {
        assert(checker.checkString('evens.map(v => v + 1);').isEmpty());
    });

    it('should report an arrow function expression that could be shorthand', function() {
        assert(checker.checkString('evens.map(v => { return v + 1; });').getErrorCount() === 1);
    });

    it('should not report an arrow function expression with multiple statements in the body', function() {
        assert(checker.checkString('evens.map(v => { v = v + 1; return v; });').isEmpty());
    });
});
