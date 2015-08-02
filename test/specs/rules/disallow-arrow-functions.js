var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowArrowFunctions: true, esnext: true });
    });

    it('should report use of arrow function', function() {
        assert.strictEqual(checker.checkString('a.map(n => n + 1);').getErrorCount(), 1);
    });

    it('should report use of multi line arrow function', function() {
        assert.strictEqual(checker.checkString([
            'a.map(n => {',
                'return n + 1;',
            '});'
        ].join('\n')).getErrorCount(), 1);
    });
});
