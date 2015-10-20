var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-after-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('does not allow spaces after commas', function() {
        checker.configure({ disallowSpaceAfterComma: true });

        expect(checker.checkString('[a, b]')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does not allow tabs after commas', function() {
        checker.configure({ disallowSpaceAfterComma: true });

        expect(checker.checkString('[a,\tb]')).to.have.one.validation.error.from('disallowSpaceAfterComma');
    });

    it('does allow commas with no spaces', function() {
        checker.configure({ disallowSpaceAfterComma: true });

        expect(checker.checkString('[a,b,c]')).to.have.no.errors();
    });

    it('does allow commas with spaces before', function() {
        checker.configure({ disallowSpaceAfterComma: true });

        expect(checker.checkString('[a ,b ,c]')).to.have.no.errors();
    });

    it('does allow commas with newline character after', function() {
        checker.configure({ disallowSpaceAfterComma: true });

        expect(checker.checkString('[a,\nb,\nc]')).to.have.no.errors();
    });
});
