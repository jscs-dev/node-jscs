var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-line-breaks', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report multiple line break', function() {
        checker.configure({ disallow_multiple_line_breaks: true });
        assert(checker.checkString('x = 1;\n\n\ny = 2;').getErrorCount() === 1);
    });
    it('should not report single line break', function() {
        checker.configure({ disallow_multiple_line_breaks: true });
        assert(checker.checkString('x = 1;\n\ny = 2').isEmpty());
    });
});
