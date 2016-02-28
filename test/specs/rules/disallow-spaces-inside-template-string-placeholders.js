var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-spaces-inside-template-string-placeholders', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowSpacesInsideTemplateStringPlaceholders: true
        });
    });

    it('should report with space after opening curly brace', function() {
        expect(checker.checkString('`${ 1}`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
    });

    it('should report with space before closing curly brace', function() {
        expect(checker.checkString('`${1 }`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
    });

    it('should report with spaces before opening and after closing curly braces', function() {
        expect(checker.checkString('`${ 1 }`')).to.have.error.count.equal(2);
    });

    it('should report with more than one space in placeholder', function() {
        expect(checker.checkString('`${  1}`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
    });

    it('should report with space in second placeholder', function() {
        expect(checker.checkString('`${1} + ${ 2}`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
    });

    it('should report with spaces in both placeholders', function() {
        expect(checker.checkString('`${ 1 } + ${ 2 }`')).to.have.error.count.equal(4);
    });

    it('should report with spaces in placeholder with expression', function() {
        expect(checker.checkString('`${ foo() }`')).to.have.error.count.equal(2);
    });

    it('should not report with spaces before and after template string', function() {
        expect(checker.checkString('x = `` ')).to.have.no.errors();
    });

    it('should not report with space before template string with closing curly brace', function() {
        expect(checker.checkString('x = `}`')).to.have.no.errors();
    });

    it('should not report with spaces inside curly braces without dollar sign', function() {
        expect(checker.checkString('`{ x }`')).to.have.no.errors();
    });

    it('should not report with no spaces in placeholder', function() {
        expect(checker.checkString('`${1}`')).to.have.no.errors();
    });

    it('should not report errors for the backticks without placeholder', function() {
        expect(checker.checkString('`test`')).to.have.no.errors();
    });

    it('should work with tagged template string', function() {
        expect(checker.checkString('tag`${1}`')).to.have.no.errors();
        expect(checker.checkString('tag`${1 }`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
        expect(checker.checkString('tag`${ 1}`')).to.have.one.validation.error
            .from('disallowSpacesInsideTemplateStringPlaceholders');
    });
});
