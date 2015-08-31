var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/maximum-line-length', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('number option', function() {
        beforeEach(function() {
            checker.configure({ maximumLineLength: 7 });
        });

        it('should report lines longer than the maximum', function() {
            expect(checker.checkString('var xyz;'))
                .to.have.one.error.from('ruleName');
        });
        it('should not report lines equal to the maximum', function() {
            expect(checker.checkString('var xy;')).to.have.no.errors();
        });
        it('should not report lines shorter than the maximum', function() {
            expect(checker.checkString('var x;')).to.have.no.errors();
        });
    });

    describe.skip('tabSize option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 8,
                    tabSize: 2
                }
            });
        });

        it('should not report lines shorter than the maximum', function() {
            expect(checker.checkString('\t\t\t\t')).to.have.no.errors();
        });
        it('should report lines longer than the maximum', function() {
            expect(checker.checkString('\t\t\t\t1'))
                .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('allowComments option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowComments: true
                }
            });
        });

        it('should not report comments', function() {
            expect(checker.checkString('// a comment\n/* a multiline\n long comment*/')).to.have.no.errors();
        });
        it('should not report comments but still report long code', function() {
            expect(checker.checkString('// a comment\nvar a = tooLong;'))
                .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('allowUrlComments option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 15,
                    allowUrlComments: true
                }
            });
        });

        it('should report comments', function() {
            expect(
                checker.checkString('// 16 characters\n/* 16 characters\n 16 characters*/')
            ).to.have.validation.error.count.which.equals(3);
        });
        it('should not report url comments if line is long because of it', function() {
            expect(checker.checkString(
                '// <16 chars https://example.com\n/* <16 chars http://example.com\n <16 chars http://example.com*/'
            )).to.have.no.errors();
        });
        it('should report url comments if line is long even without it', function() {
            expect(checker.checkString('// 16 characters https://example.com'))
                .to.have.one.error.from('ruleName');
        });
        it('should not report comments but still report long code', function() {
            expect(checker.checkString('// a comment\nvar a = tooLong;'))
                .to.have.one.error.from('ruleName');
        });
        it('should recognize http', function() {
            expect(checker.checkString('// http://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// http://example.com/is/a/url <16 chars')).to.have.no.errors();
        });
        it('should recognize https', function() {
            expect(checker.checkString('// https://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// https://example.com/is/a/url <16 chars')).to.have.no.errors();
        });
        it('should recognize ftp', function() {
            expect(checker.checkString('// ftp://example.com/is/a/url')).to.have.no.errors();
            expect(checker.checkString('// ftp://example.com/is/a/url <16 chars')).to.have.no.errors();
        });
        it('should ignore things that arent quite urls', function() {
            expect(checker.checkString('// www.example.com/is/not/a/url'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('// example.com/is/not/a/url'))
                .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('allowRegex option', function() {
        beforeEach(function() {
            checker.configure({
                maximumLineLength: {
                    value: 4,
                    allowRegex: true
                }
            });
        });

        it('should not report regex literals', function() {
            expect(checker.checkString('var a = /longregex/')).to.have.no.errors();
        });
        it('should not report regex literals but still report long code', function() {
            expect(checker.checkString('var a = /longregex/;\nvar b = tooLong;'))
                .to.have.one.error.from('ruleName');
        });
        it('should not report regexes literals but still report regex constructors', function() {
            expect(checker.checkString('var a = /l/;\nvar b = l;\nvar a = new Regex("/l/");')).to.have.validation.error.count.which.equals(2);
        });
        it('should not be destructive to original data', function() {
            expect(checker.checkString('var a = /regex/;')._file._lines[0].length).to.be.above(1);
        });

    });
});
