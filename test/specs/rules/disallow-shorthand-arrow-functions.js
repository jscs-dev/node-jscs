var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-shorthand-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, disallowShorthandArrowFunctions: true });
    });

    it('should report a shorthand arrow function expression', function() {
        assert.strictEqual(checker.checkString('evens.map(v => v + 1);').getErrorCount(), 1);
    });

    it('should not report an arrow function with a block', function() {
        assert(checker.checkString('evens.map(v => { return v + 1; });').isEmpty());
    });
});
