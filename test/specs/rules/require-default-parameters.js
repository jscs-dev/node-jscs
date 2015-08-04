var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-default-parameters', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireDefaultParameters: true, esnext: true });
    });

    it('should not report use of default parameters', function() {
        assert(checker.checkString([
            'function multiply(a, b = 1) {',
                'return a * b;',
            '}'
        ].join('\n')).isEmpty());
    });

    it('should report use of checking for undefined parameters with the || operator', function() {
        assert(checker.checkString([
            'function multiply(a, b) {',
                'b = b || 1;',
                'return a * b;',
            '}'
        ].join('\n')).getErrorCount() === 1);
    });

    it('should report use of checking for undefined parameters with ternary and typeof', function() {
        assert(checker.checkString([
            'function multiply(a, b) {',
                'b = typeof b !== \'undefined\' ?  b : 1;',
                'return a * b;',
            '}'
        ].join('\n')).getErrorCount() === 1);
    });
});
