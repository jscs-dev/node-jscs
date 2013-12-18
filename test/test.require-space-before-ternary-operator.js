var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-space-before-ternary-operator', function() {

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeTernaryOperator: true });
    });
    it('should report about space absence before tokens "?" and ":" ("a? b: c;")', function() {
        assert(checker.checkString('a? b: c;').getErrorCount() === 2);
    });
    // See https://github.com/mdevils/node-jscs/issues/87
    it('should report if space behind parentheses ("( a )? ( b ): c;")', function() {
        assert(checker.checkString('( a )? ( b ): c;').getErrorCount() === 2);
    });
    // See https://github.com/mdevils/node-jscs/issues/68
    it('should not report about token ":" in object', function() {
        assert(checker.checkString('{ a : b};').isEmpty());
    });
});
