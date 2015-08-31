var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;
var expect = require('chai').expect;

describe.skip('rules/validate-quote-marks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
        it('should throw if config.escape is not set', function() {
            expect(function() {
                checker.configure({ validateQuoteMarks: {} });
            }).to.throw();
        });

        it('should throw if config.mark is not set', function() {
            expect(function() {
                checker.configure({ validateQuoteMarks: { escape: true } });
            }).to.throw();
        });
    });

    describe.skip('option value \' ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: '\'' });
        });

        it('should report double quotes in strings', function() {
            expect(checker.checkString('var x = "x";')).to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\';')).to.have.no.errors();
        });

        it('should not report double quotes values in single quotes strings', function() {
            expect(checker.checkString('var x = \'"x"\';')).to.have.no.errors();
        });

        it('should not report double quotes in comments', function() {
            expect(checker.checkString('var x = \'x\'; /*"y"*/')).to.have.no.errors();
        });
    });

    describe.skip('option value \' and escape ', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: '\'',
                    escape: true
                }
            });
        });

        it('should report double quotes in strings', function() {
            expect(checker.checkString('var x = "x";')).to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report double quotes to avoid escaping', function() {
            expect(checker.checkString('var x = "\'x\'";')).to.have.no.errors();
        });

        it('should not report single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\';')).to.have.no.errors();
        });

        it('should not report double quotes values in single quotes strings', function() {
            expect(checker.checkString('var x = \'"x"\';')).to.have.no.errors();
        });

        it('should not report double quotes in comments', function() {
            expect(checker.checkString('var x = \'x\'; /*"y"*/')).to.have.no.errors();
        });
    });

    describe.skip('option value " ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: '"' });
        });

        it('should report single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\';')).to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report double quotes in strings', function() {
            expect(checker.checkString('var x = "x";')).to.have.no.errors();
        });

        it('should not report single quotes values in double quotes strings', function() {
            expect(checker.checkString('var x = "\'x\'";')).to.have.no.errors();
        });

        it('should not report single quotes in comments', function() {
            expect(checker.checkString('var x = "x"; /*\'y\'*/')).to.have.no.errors();
        });
    });

    describe.skip('option value " and escape ', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: '"',
                    escape: true
                }
            });
        });

        it('should report single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\';'))
            .to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report single quotes to avoid escaping', function() {
            expect(checker.checkString('var x = \'"x"\';')).to.have.no.errors();
        });

        it('should not report double quotes in strings', function() {
            expect(checker.checkString('var x = "x";')).to.have.no.errors();
        });

        it('should not report single quotes values in double quotes strings', function() {
            expect(checker.checkString('var x = "\'x\'";')).to.have.no.errors();
        });

        it('should not report single quotes in comments', function() {
            expect(checker.checkString('var x = "x"; /*\'y\'*/')).to.have.no.errors();
        });
    });

    describe.skip('option value true ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: true });
        });

        it('should report inconsistent quotes in strings', function() {
            expect(checker.checkString('var x = \'x\', y = "y";')).to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report consistent single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\', y = \'y\';')).to.have.no.errors();
        });

        it('should not report consistent double quotes in strings', function() {
            expect(checker.checkString('var x = "x", y = "y";')).to.have.no.errors();
        });

        it('should not report inconsistent quotes in comments', function() {
            expect(checker.checkString('var x = "x", y = "y"; /*\'y\'*/')).to.have.no.errors();
        });
    });

    describe.skip('option value true and escape', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: true,
                    escape: true
                }
            });
        });

        it('should report inconsistent quotes in strings', function() {
            expect(checker.checkString('var x = \'x\', y = "y";')).to.have.one.error.from('validateQuoteMarks');
        });

        it('should not report inconsistent quotes to avoid escaping', function() {
            expect(checker.checkString('var x = \'x\', y = "\'y\'";')).to.have.no.errors();
        });

        it('should not report consistent single quotes in strings', function() {
            expect(checker.checkString('var x = \'x\', y = \'y\';')).to.have.no.errors();
        });

        it('should not report consistent double quotes in strings', function() {
            expect(checker.checkString('var x = "x", y = "y";')).to.have.no.errors();
        });

        it('should not report inconsistent quotes in comments', function() {
            expect(checker.checkString('var x = "x", y = "y"; /*\'y\'*/')).to.have.no.errors();
        });
    });

    reportAndFix({
        name: 'should fix (simple case)',
        rules: {
            validateQuoteMarks: {
                mark: '"',
                escape: true
            }
        },
        input: '\'\'',
        output: '""'
    });

    reportAndFix({
        name: 'should fix \'1\'2\'',
        rules: {
            validateQuoteMarks: '\''
        },
        errors: 1,
        input: ' "1\'2" ',

        // Check string in the string with same quotes, had to use "\\\"
        output: ' \'1\\\'2\' '
    });
});
