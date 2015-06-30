var Checker = require('../../../lib/checker');
var assert = require('assert');
var assertHelpers = require('../../lib/assertHelpers');

describe('rules/validate-quote-marks', function() {
    var checker;
    var rules;

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
        rules = { validateQuoteMarks: '\'' };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'double quotes in strings',
            rules: rules,
            input: 'var x = "x";',
            output: 'var x = \'x\';'
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
        rules = {
            validateQuoteMarks: {
                mark: '\'',
                escape: true
            }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'double quotes in strings',
            rules: rules,
            input: 'var x = "x";',
            output: 'var x = \'x\';'
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
        rules = { validateQuoteMarks: '"' };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'single quotes in strings',
            rules: rules,
            input: 'var x = \'x\';',
            output: 'var x = "x";'
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
        rules = {
            validateQuoteMarks: {
                mark: '"',
                escape: true
            }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'single quotes in strings',
            rules: rules,
            input: 'var x = \'x\';',
            output: 'var x = "x";'
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
        rules = { validateQuoteMarks: true };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'inconsistent quotes in strings',
            rules: rules,
            input: 'var x = \'x\', y = "y";',
            output: 'var x = \'x\', y = \'y\';'
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
        rules = {
            validateQuoteMarks: {
                mark: true,
                escape: true
            }
        };

        beforeEach(function() {
            checker.configure(rules);
        });

        assertHelpers.reportAndFix({
            name: 'inconsistent quotes in strings',
            rules: rules,
            input: 'var x = \'x\', y = "y";',
            output: 'var x = \'x\', y = \'y\';'
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
});
