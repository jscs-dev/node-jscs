var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/maximum-line-length', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report lines longer than the maximum', function() {
        checker.configure({ maximumLineLength: 7 });
        assert(checker.checkString('var xyz;').getErrorCount() === 1);
    });
    it('should not report lines equal to the maximum', function() {
        checker.configure({ maximumLineLength: 7 });
        assert(checker.checkString('var xy;').isEmpty());
    });
    it('should not report lines shorter than the maximum', function() {
        checker.configure({ maximumLineLength: 7 });
        assert(checker.checkString('var x;').isEmpty());
    });
    it('should not report lines shorter than the maximum with object value', function() {
        checker.configure({
            maximumLineLength: {
                value: 8,
                tabSize: 2
            }
        });
        assert(checker.checkString('\t\t\t\t').isEmpty());
    });
    it('should report lines longer than the maximum with object value', function() {
        checker.configure({
            maximumLineLength: {
                value: 8,
                tabSize: 2
            }
        });
        assert(checker.checkString('\t\t\t\t1').getErrorCount() === 1);
    });
});
