var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-shorthand-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowShorthandArrowFunctions: true });
    });

    it('should report a shorthand arrow function expression', function() {
        expect(checker.checkString('evens.map(v => v + 1);'))
          .to.have.one.validation.error.from('disallowShorthandArrowFunctions');
    });

    it('should not report an arrow function with a block', function() {
        expect(checker.checkString('evens.map(v => { return v + 1; });')).to.have.no.errors();
    });
});
