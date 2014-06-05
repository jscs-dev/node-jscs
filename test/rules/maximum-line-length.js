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

    it('should not report comments with allow comment option', function() {
        checker.configure({
            maximumLineLength: {
                value: 4,
                allowComments: true
            }
        });
        assert(checker.checkString('// a comment\n/* a multiline\n long comment*/').isEmpty());
    });
    it('should not report comments but still report long code with allow comment option', function() {
        checker.configure({
            maximumLineLength: {
                value: 4,
                allowComments: true
            }
        });
        assert(checker.checkString('// a comment\nvar a = tooLong;').getErrorCount() === 1);
    });

    it('should not report regex literals with allow regex option', function() {
        checker.configure({
            maximumLineLength: {
                value: 4,
                allowRegex: true
            }
        });
        assert(checker.checkString('var a = /longregex/').isEmpty());
    });
    it('should not report regex literals but still report long code with allow regex option', function() {
        checker.configure({
            maximumLineLength: {
                value: 4,
                allowRegex: true
            }
        });
        assert(checker.checkString('var a = /longregex/;\nvar b = tooLong;').getErrorCount() === 1);
    });
    it('should not report regexes literals but still report regex constructors with allow regex option', function() {
        checker.configure({
            maximumLineLength: {
                value: 4,
                allowRegex: true
            }
        });
        assert(checker.checkString('var a = /l/;\nvar b = l;\nvar a = new Regex("/l/");').getErrorCount() === 2);
    });
});
