var assert = require('assert');
var Checker = require('../../lib/checker');

describe('extract-js', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('common', function() {
        it('should not throw an exceptions on error explain (console reporter)', function() {
            checker.configure({
                disallowKeywords: ['with'],
                extract: ['**']
            });

            return checker.checkPath('./test/data/extract').then(function(errorsCollection) {
                var errorCount = 0;

                assert.doesNotThrow(function() {
                    errorsCollection.forEach(function(errors) {
                        if (!errors.isEmpty()) {
                            errors.getErrorList().forEach(function(error) {
                                errors.explainError(error, true);
                                errorCount++;
                            });
                        }
                    });
                });

                assert.equal(errorCount, 5);
            });
        });
    });

    describe('whitespaces', function() {
        it('should be no errors on disallowTrailingWhitespace', function() {
            checker.configure({
                disallowTrailingWhitespace: true
            });

            return checker.extractFile('./test/data/extract/index.html').then(function(errors) {
                assert(errors.isEmpty());
            });
        });

        it('should be errors on disallowMixedSpacesAndTabs', function() {
            checker.configure({
                disallowMixedSpacesAndTabs: true
            });

            return checker.extractFile('./test/data/extract/index.html').then(function(errors) {
                // disallowMixedSpacesAndTabs doesn't warn when some line contains only tabs
                // and some only spaces (i.e. '\s\svar foo;\t\tvar bar;'). If this behavior
                // will change here will be three errors.
                assert(errors.getErrorList().length === 1);
            });
        });

        it('should be no errors on validateIndentation', function() {
            checker.configure({
                validateIndentation: 2
            });

            return checker.extractFile('./test/data/extract/always.htm').then(function(errors) {
                assert(errors.isEmpty());
            });
        });
    });
});
