var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('does not allow spaces before commas', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('var a ,b;')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does not allow tabs before commas', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('var a\t,b;')).to.have.one.validation.error.from('disallowSpaceBeforeComma');
    });

    it('does allow commas with no spaces', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('var a,b;')).to.have.no.errors();
    });

    it('does allow commas with spaces after', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('[a, b, c]')).to.have.no.errors();
    });

    it('does allow commas with newline character before', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('[a\n,b\n,c]')).to.have.no.errors();
    });
});
