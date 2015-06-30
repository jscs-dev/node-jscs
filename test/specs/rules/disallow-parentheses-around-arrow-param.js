var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-parentheses-around-arrow-param', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, disallowParenthesesAroundArrowParam: true });
    });

    it('should not report without parens', function() {
        expect(checker.checkString('[1, 2].map(x => x * x);')).to.have.no.errors();
    });

    it('should report with parens around a single parameter', function() {
        expect(checker.checkString('[1, 2].map((x) => x * x);'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report with parens around multiple parameters', function() {
        expect(checker.checkString('[1, 2].map((x, y) => x * x);')).to.have.no.errors();
    });

    it('should not report with parens around a single parameter with a default', function() {
        expect(checker.checkString('const a = (x = 1) => x * x;')).to.have.no.errors();
    });

    it('should not report with parens around a multiple parameters with a default', function() {
        expect(checker.checkString('const a = (x = 1, y) => x * y;')).to.have.no.errors();
    });
});
