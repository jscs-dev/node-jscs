var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-parentheses-around-arrow-param', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowParenthesesAroundArrowParam: true });
    });

    it('should not report without parens', function() {
        expect(checker.checkString('[1, 2].map(x => x * x);')).to.have.no.errors();
    });

    it('should report with parens around a single parameter', function() {
        expect(checker.checkString('[1, 2].map((x) => x * x);'))
          .to.have.one.validation.error.from('disallowParenthesesAroundArrowParam');
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

    it('should not report with use of destructuring #1672', function() {
        expect(checker.checkString('let func = ({hoge}) => hoge')).to.have.no.errors();
    });

    it('should not report with multiple parameters and destructuring', function() {
        expect(checker.checkString('let func = (foo, {hoge}) => hoge')).to.have.no.errors();
    });

    it('should not error with no params #1747', function() {
        expect(checker.checkString('() => {};')).to.have.no.errors();
    });

    it('should not report an arrow function expression with a single rest param #1616, #1831', function() {
        expect(checker.checkString('[1, 2].map((...x) => x);')).to.have.no.errors();
    });

    it('should not report an arrow function expression with a single array param #1831', function() {
        expect(checker.checkString('[1, 2].map(([x]) => x);')).to.have.no.errors();
    });
});
