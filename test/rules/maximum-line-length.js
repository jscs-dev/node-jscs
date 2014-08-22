var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/maximum-line-length', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('number option', function() {
        beforeEach(function() {
            checker.configure({ maximumLineLength: 7 });
        });

        it('should report lines longer than the maximum', function() {
            assert(checker.checkString('var xyz;').getErrorCount() === 1);
        });
        it('should not report lines equal to the maximum', function() {
            assert(checker.checkString('var xy;').isEmpty());
        });
        it('should not report lines shorter than the maximum', function() {
            assert(checker.checkString('var x;').isEmpty());
        });
    });

    describe('tabSize option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 8,
                    tabSize: 2
                }
            });
        });

        it('should not report lines shorter than the maximum', function() {
            assert(checker.checkString('\t\t\t\t').isEmpty());
        });
        it('should report lines longer than the maximum', function() {
            assert(checker.checkString('\t\t\t\t1').getErrorCount() === 1);
        });
    });

    describe('allowComments option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowComments: true
                }
            });
        });

        it('should not report comments', function() {
            assert(checker.checkString('// a comment\n/* a multiline\n long comment*/').isEmpty());
        });
        it('should not report comments but still report long code', function() {
            assert(checker.checkString('// a comment\nvar a = tooLong;').getErrorCount() === 1);
        });
    });

    describe('allowUrlComments option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 15,
                    allowUrlComments: true
                }
            });
        });

        it('should report comments', function() {
            assert(checker.checkString('// 16 characters' +
                '\n/* 16 characters\n 16 characters*/').getErrorCount() === 3);
        });
        it('should not report url comments if line is long because of it', function() {
            assert(checker.checkString('// <16 chars https://example.com' +
                '\n/* <16 chars http://example.com\n <16 chars http://example.com*/').isEmpty());
        });
        it('should report url comments if line is long even without it', function() {
            assert(checker.checkString('// 16 characters https://example.com').getErrorCount() === 1);
        });
        it('should not report comments but still report long code', function() {
            assert(checker.checkString('// a comment\nvar a = tooLong;').getErrorCount() === 1);
        });
        it('should recognize http', function() {
            assert(checker.checkString('// http://example.com/is/a/url').isEmpty());
            assert(checker.checkString('// http://example.com/is/a/url <16 chars').isEmpty());
        });
        it('should recognize https', function() {
            assert(checker.checkString('// https://example.com/is/a/url').isEmpty());
            assert(checker.checkString('// https://example.com/is/a/url <16 chars').isEmpty());
        });
        it('should recognize ftp', function() {
            assert(checker.checkString('// ftp://example.com/is/a/url').isEmpty());
            assert(checker.checkString('// ftp://example.com/is/a/url <16 chars').isEmpty());
        });
        it('should ignore things that arent quite urls', function() {
            assert(checker.checkString('// www.example.com/is/not/a/url').getErrorCount() === 1);
            assert(checker.checkString('// example.com/is/not/a/url').getErrorCount() === 1);
        });
    });

    describe('allowRegex option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowRegex: true
                }
            });
        });

        it('should not report regex literals', function() {
            assert(checker.checkString('var a = /longregex/').isEmpty());
        });
        it('should not report regex literals but still report long code', function() {
            assert(checker.checkString('var a = /longregex/;\nvar b = tooLong;').getErrorCount() === 1);
        });
        it('should not report regexes literals but still report regex constructors', function() {
            assert(checker.checkString('var a = /l/;\nvar b = l;\nvar a = new Regex("/l/");').getErrorCount() === 2);
        });
        it('should not be destructive to original data', function() {
            assert(checker.checkString('var a = /regex/;')._file._lines[ 0 ].length > 1);
        });

    });
});
