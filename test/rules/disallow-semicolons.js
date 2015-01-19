var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-semicolons', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSemicolons: true });
    });

    it('should not allow semicolons at end of line', function() {
        assert(checker.checkString([
            'var a = 1;',
            'var b = 2;',
            'function c() {}',
            'd();'
        ].join('\n')).getErrorCount() === 3);
    });

    it('should allow semicolons inline', function() {
        assert(checker.checkString([
            'for (var i = 0; i < l; i++) {',
            'go()',
            '}'
        ].join('\n')).isEmpty());
    });

    it('should allow semicolons at start of line', function() {
        assert(checker.checkString([
            'var foo = function () {}',
            ';[1, 2].forEach(foo)'
        ].join('\n')).isEmpty());
    });
});
