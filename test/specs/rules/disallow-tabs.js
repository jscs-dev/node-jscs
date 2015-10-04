var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-tabs', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowTabs: true });
    });

    it('should report tab', function() {
        expect(checker.checkString('\tvar foo;')).to.have.one.validation.error.from('disallowTabs');
    });

    it('should report tab in comment', function() {
        expect(checker.checkString('\t// a comment')).to.have.one.validation.error.from('disallowTabs');
    });

    it('should report tab at end of line', function() {
        expect(checker.checkString('var foo;\t')).to.have.one.validation.error.from('disallowTabs');
    });

    it('should not report tab', function() {
        expect(checker.checkString('var foo;')).to.have.no.errors();
    });
});
