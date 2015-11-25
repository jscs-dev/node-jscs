var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-mixed-spaces-and-tabs', function() {
    var checker;
    var multilineNotDocBlock = '\n\t/*\n\t * comment\n\t */';
    var docblock = '\n\t/**\n\t * comment\n\t */';
    var docblockWithMixed = '\n\t/**\n\t * comment \t \t\n\t */';

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowMixedSpacesAndTabs: true });
        });

        it('should report spaces before tabs', function() {
            expect(checker.checkString('    \tvar x;')).to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces', function() {
            expect(checker.checkString('\t     var x;'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report spaces before tabs before spaces', function() {
            expect(checker.checkString('    \t    var x;'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces before tabs', function() {
            expect(checker.checkString('\t     \tvar x;'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report spaces before tabs after content', function() {
            expect(checker.checkString('var x;    \t')).to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces after content', function() {
            expect(checker.checkString('var x;\t     '))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report spaces before tabs before space after content', function() {
            expect(checker.checkString('var x;    \t    '))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces before tabs after content', function() {
            expect(checker.checkString('var x;\t     \t'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before single space to align non-docblock multiline', function() {
            expect(checker.checkString('var x;' + multilineNotDocBlock)).to.have.no.errors();
        });

        it('should not report tabs before single space to align docblock', function() {
            expect(checker.checkString('var x;' + docblock)).to.have.no.errors();
        });

        it('should not report tabs after spaces after star in a docblock', function() {
            expect(checker.checkString('var x;' + docblockWithMixed)).to.have.no.errors();
        });

        it('should not report commented out code', function() {
            expect(checker.checkString('//\t    var x;')).to.have.no.errors();
        });

        it('should not report tabs only', function() {
            expect(checker.checkString('\t\tvar x;')).to.have.no.errors();
        });

        it('should not report tabs only with multiline comment in between', function() {
            expect(checker.checkString('\t/**/\tvar x;')).to.have.no.errors();
        });

        it('should not report spaces only', function() {
            expect(checker.checkString('    var x;')).to.have.no.errors();
        });
    });

    describe('option value "smart"', function() {
        beforeEach(function() {
            checker.configure({ disallowMixedSpacesAndTabs: 'smart' });
        });

        it('should report spaces before tabs', function() {
            expect(checker.checkString('    \tvar x;')).to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should not report tabs before spaces', function() {
            expect(checker.checkString('\t     var x;')).to.have.no.errors();
        });

        it('should report spaces before tabs before spaces', function() {
            expect(checker.checkString('    \t    var x;'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces before tabs', function() {
            expect(checker.checkString('\t     \tvar x;'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report spaces before tabs after content', function() {
            expect(checker.checkString('var x;    \t')).to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces after content', function() {
            expect(checker.checkString('var x;\t     ')).to.have.no.errors();
        });

        it('should report spaces before tabs before space after content', function() {
            expect(checker.checkString('var x;    \t    '))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should report tabs before spaces before tabs after content', function() {
            expect(checker.checkString('var x;\t     \t'))
              .to.have.one.validation.error.from('disallowMixedSpacesAndTabs');
        });

        it('should not report tabs before single space to align docblock', function() {
            expect(checker.checkString('var x;' + docblock)).to.have.no.errors();
        });

        it('should not report tabs after spaces after star in a docblock', function() {
            expect(checker.checkString('var x;' + docblockWithMixed)).to.have.no.errors();
        });

        it('should not report commented out code', function() {
            expect(checker.checkString('//\t    var x;')).to.have.no.errors();
        });

        it('should not report tabs only', function() {
            expect(checker.checkString('\t\tvar x;')).to.have.no.errors();
        });

        it('should not report spaces only', function() {
            expect(checker.checkString('    var x;')).to.have.no.errors();
        });
    });
});
