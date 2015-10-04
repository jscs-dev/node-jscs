var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-capitalized-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowCapitalizedComments: true });
    });
    it('should report on an uppercase start of a comment', function() {
        expect(checker.checkString('//Invalid')).to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('// Invalid')).to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('/** Invalid */')).to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('/**\n * Invalid\n */'))
          .to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('/* Invalid */')).to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('/*\n Invalid\n */'))
          .to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('//\xDCber')).to.have.one.validation.error.from('disallowCapitalizedComments');
        expect(checker.checkString('//\u03A0')).to.have.one.validation.error.from('disallowCapitalizedComments');
    });

    it('should not report on a lowercase start of a comment', function() {
        expect(checker.checkString('//valid')).to.have.no.errors();
        expect(checker.checkString('// valid')).to.have.no.errors();
        expect(checker.checkString('/** valid */')).to.have.no.errors();
        expect(checker.checkString('//\xFCber')).to.have.no.errors();
        expect(checker.checkString('//\u03C0')).to.have.no.errors();
    });

    it('should not report on comments that start with a non-alphabetical character', function() {
        expect(checker.checkString('//123')).to.have.no.errors();
        expect(checker.checkString('// 123')).to.have.no.errors();
        expect(checker.checkString('/**123*/')).to.have.no.errors();
        expect(checker.checkString('/**\n @todo: foobar\n */')).to.have.no.errors();
        expect(checker.checkString('/** 123*/')).to.have.no.errors();
    });
});
