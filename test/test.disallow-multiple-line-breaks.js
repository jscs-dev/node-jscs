var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-line-breaks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report multiple line break', function() {
        checker.configure({ disallowMultipleLineBreaks: true });
        assert(checker.checkString('x = 1;\n\n\ny = 2;').getErrorCount() === 1);
    });
    it('should not report single line break', function() {
        checker.configure({ disallowMultipleLineBreaks: true });
        assert(checker.checkString('x = 1;\n\ny = 2').isEmpty());
    });
    it('should report only once per each sequence of line breaks', function() {
        checker.configure({ disallowMultipleLineBreaks: true });
        assert(checker.checkString('x = 1;\n\n\n\n\ny = 2').getErrorCount() === 1);
    });
    it('should report multiple line break if CRLF is used', function() {
        checker.configure({ disallowMultipleLineBreaks: true });
        assert(checker.checkString('x = 1;\r\n\r\n\r\ny = 2').getErrorCount() === 1);
    });
});
