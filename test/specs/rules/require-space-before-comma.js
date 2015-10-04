var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('requires spaces before commas', function() {
        checker.configure({ requireSpaceBeforeComma: true });

        expect(checker.checkString('var a,b;')).to.have.one.validation.error.from('requireSpaceBeforeComma');
    });

    it('does allow commas with no spaces', function() {
        checker.configure({ requireSpaceBeforeComma: true });

        expect(checker.checkString('var a ,b;')).to.have.no.errors();
    });
});
