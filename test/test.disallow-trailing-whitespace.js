var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-trailing-whitespace', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowTrailingWhitespace: true });
    });

    it('should report trailing spaces', function() {
        assert(checker.checkString('var x; ').getErrorCount() === 1);
    });

    it('should report trailing tabs', function() {
        assert(checker.checkString('var x;\t').getErrorCount() === 1);
    });

    it('should report once for each line', function() {
        assert(checker.checkString('var x;\t\nvar y;\t').getErrorCount() === 2);
    });

    it('should not report multiline strings with trailing whitespace', function() {
        assert(checker.checkString('var x = \' \\\n \';').isEmpty());
    });

    it('should not report when there is no trailing whitespace', function() {
        assert(checker.checkString('var x;').isEmpty());
    });
});
