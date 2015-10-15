var expect = require('chai').expect;
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

                expect(function() {
                    errorsCollection.forEach(function(errors) {
                        if (!errors.isEmpty()) {
                            errors.getErrorList().forEach(function(error) {
                                errors.explainError(error, true);
                                errorCount++;
                            });
                        }
                    });
                }).to.not.throw();

                expect(errorCount).to.equal(5);
            });
        });
    });

    describe('whitespaces', function() {
        it('should be no errors on disallowTrailingWhitespace', function() {
            checker.configure({
                disallowTrailingWhitespace: true,
                extract: true
            });

            return checker.extractFile('./test/data/extract/index.html').then(function(errors) {
                expect(errors).to.have.no.errors();
            });
        });

        it('should be errors on disallowMixedSpacesAndTabs', function() {
            checker.configure({
                disallowMixedSpacesAndTabs: true,
                extract: true
            });

            return checker.extractFile('./test/data/extract/index.html').then(function(errors) {
                // disallowMixedSpacesAndTabs doesn't warn when some line contains only tabs
                // and some only spaces (i.e. '\s\svar foo;\t\tvar bar;'). If this behavior
                // will change here will be three errors.
                expect(errors.getErrorList().length).to.equal(1);
            });
        });

        it('should be no errors on validateIndentation', function() {
            checker.configure({
                validateIndentation: 2,
                extract: true
            });

            return checker.extractFile('./test/data/extract/always.htm').then(function(errors) {
                expect(errors).to.have.no.errors();
            });
        });
    });
});
