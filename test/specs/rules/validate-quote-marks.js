var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;
var assert = require('assert');

describe('rules/validate-quote-marks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw if config.escape is not set', function() {
            assert.throws(function() {
                checker.configure({ validateQuoteMarks: {} });
            });
        });

        it('should throw if config.mark is not set', function() {
            assert.throws(function() {
                checker.configure({ validateQuoteMarks: { escape: true } });
            });
        });
    });

    describe('option value \' ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: '\'' });
        });

        it('should report double quotes in strings', function() {
            assert(checker.checkString('var x = "x";').getErrorCount() === 1);
        });

        it('should not report single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\';').isEmpty());
        });

        it('should not report double quotes values in single quotes strings', function() {
            assert(checker.checkString('var x = \'"x"\';').isEmpty());
        });

        it('should not report double quotes in comments', function() {
            assert(checker.checkString('var x = \'x\'; /*"y"*/').isEmpty());
        });
    });

    describe('option value \' and escape ', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: '\'',
                    escape: true
                }
            });
        });

        it('should report double quotes in strings', function() {
            assert(checker.checkString('var x = "x";').getErrorCount() === 1);
        });

        it('should not report double quotes to avoid escaping', function() {
            assert(checker.checkString('var x = "\'x\'";').isEmpty());
        });

        it('should not report single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\';').isEmpty());
        });

        it('should not report double quotes values in single quotes strings', function() {
            assert(checker.checkString('var x = \'"x"\';').isEmpty());
        });

        it('should not report double quotes in comments', function() {
            assert(checker.checkString('var x = \'x\'; /*"y"*/').isEmpty());
        });
    });

    describe('option value " ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: '"' });
        });

        it('should report single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\';').getErrorCount() === 1);
        });

        it('should not report double quotes in strings', function() {
            assert(checker.checkString('var x = "x";').isEmpty());
        });

        it('should not report single quotes values in double quotes strings', function() {
            assert(checker.checkString('var x = "\'x\'";').isEmpty());
        });

        it('should not report single quotes in comments', function() {
            assert(checker.checkString('var x = "x"; /*\'y\'*/').isEmpty());
        });
    });

    describe('option value " and escape ', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: '"',
                    escape: true
                }
            });
        });

        it('should report single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\';').getErrorCount() === 1);
        });

        it('should not report single quotes to avoid escaping', function() {
            assert(checker.checkString('var x = \'"x"\';').isEmpty());
        });

        it('should not report double quotes in strings', function() {
            assert(checker.checkString('var x = "x";').isEmpty());
        });

        it('should not report single quotes values in double quotes strings', function() {
            assert(checker.checkString('var x = "\'x\'";').isEmpty());
        });

        it('should not report single quotes in comments', function() {
            assert(checker.checkString('var x = "x"; /*\'y\'*/').isEmpty());
        });
    });

    describe('option value true ', function() {
        beforeEach(function() {
            checker.configure({ validateQuoteMarks: true });
        });

        it('should report inconsistent quotes in strings', function() {
            assert(checker.checkString('var x = \'x\', y = "y";').getErrorCount() === 1);
        });

        it('should not report consistent single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\', y = \'y\';').isEmpty());
        });

        it('should not report consistent double quotes in strings', function() {
            assert(checker.checkString('var x = "x", y = "y";').isEmpty());
        });

        it('should not report inconsistent quotes in comments', function() {
            assert(checker.checkString('var x = "x", y = "y"; /*\'y\'*/').isEmpty());
        });
    });

    describe('option value true and escape', function() {
        beforeEach(function() {
            checker.configure({
                validateQuoteMarks: {
                    mark: true,
                    escape: true
                }
            });
        });

        it('should report inconsistent quotes in strings', function() {
            assert(checker.checkString('var x = \'x\', y = "y";').getErrorCount() === 1);
        });

        it('should not report inconsistent quotes to avoid escaping', function() {
            assert(checker.checkString('var x = \'x\', y = "\'y\'";').isEmpty());
        });

        it('should not report consistent single quotes in strings', function() {
            assert(checker.checkString('var x = \'x\', y = \'y\';').isEmpty());
        });

        it('should not report consistent double quotes in strings', function() {
            assert(checker.checkString('var x = "x", y = "y";').isEmpty());
        });

        it('should not report inconsistent quotes in comments', function() {
            assert(checker.checkString('var x = "x", y = "y"; /*\'y\'*/').isEmpty());
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
