var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/validate-line-breaks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report invalid line break character once per file', function() {
        checker.configure({ validateLineBreaks: 'LF' });
        assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\r\n').getErrorCount(), 1);
    });
    it('should report all invalid line break character', function() {
        checker.configure({ validateLineBreaks: { character: 'LF', reportOncePerFile: false }});
        assert.strictEqual(checker.checkString('x = 1;\r\ny = 2;\nz = 3;\r\n').getErrorCount(), 2);
    });
    it('should not report invalid line break character', function() {
        checker.configure({ validateLineBreaks: 'LF' });
        assert(checker.checkString('x = 1;\ny = 2;\n').isEmpty());
    });
});
