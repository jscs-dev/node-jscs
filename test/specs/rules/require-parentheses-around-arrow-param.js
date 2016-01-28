var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-parentheses-around-arrow-param', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireParenthesesAroundArrowParam: true });
    });

    it('should report an arrow function expression without parens', function() {
        expect(checker.checkString('[1, 2].map(x => x * x);'))
          .to.have.one.validation.error.from('requireParenthesesAroundArrowParam');
    });

    it('should not report an arrow function expression with parens around a single parameter', function() {
        expect(checker.checkString('[1, 2].map((x) => x * x);')).to.have.no.errors();
    });

    it('should not report an arrow function expression with parens around multiple parameters', function() {
        expect(checker.checkString('[1, 2].map((x, y) => x * x);')).to.have.no.errors();
    });

    it('should not report an arrow function expression with a single rest param #1616', function() {
        expect(checker.checkString('[1, 2].map((...x) => x);')).to.have.no.errors();
    });
});
