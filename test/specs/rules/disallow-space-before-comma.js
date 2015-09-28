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

    it('does allow commas with no spaces', function() {
        checker.configure({ disallowSpaceBeforeComma: true });

        expect(checker.checkString('var a,b;')).to.have.no.errors();
    });
});
