var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-between-arguments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBetweenArguments: true });
    });

    it('should report unexpected space for a(b, c)', function() {
        expect(checker.checkString('a(b, c);')).to.have.one.validation.error.from('disallowSpaceBetweenArguments');
    });

    it('should report 2 unexpected spaces for a(b, c, d)', function() {
        expect(checker.checkString('a(b, c, d);')).to.have.error.count.equal(2);
    });

    it('should not report any errors for a(b,c)', function() {
        expect(checker.checkString('a(b,c);')).to.have.no.errors();
    });

    it('should not report any errors for a(b)', function() {
        expect(checker.checkString('a(b);')).to.have.no.errors();
    });

    it('should not report for a(foo(),b)', function() {
        expect(checker.checkString('a(foo(),b);')).to.have.no.errors();
    });

    it('should not report for a(foo(1,2),b)', function() {
        expect(checker.checkString('a(foo(1,2),b);')).to.have.no.errors();
    });

    it('should report for a(foo(1, 2), b)', function() {
        expect(checker.checkString('a(foo(1, 2), b);')).to.have.error.count.equal(2);
    });
});
