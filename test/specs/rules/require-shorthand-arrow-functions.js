var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-shorthand-arrow-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireShorthandArrowFunctions: true });
    });

    it('should report a shorthand arrow function expression', function() {
        expect(checker.checkString('evens.map(v => v + 1);')).to.have.no.errors();
    });

    it('should report an arrow function expression that could be shorthand', function() {
        expect(checker.checkString('evens.map(v => { return v + 1; });'))
          .to.have.one.validation.error.from('requireShorthandArrowFunctions');
    });

    it('should not report an arrow function expression with multiple statements in the body', function() {
        expect(checker.checkString('evens.map(v => { v = v + 1; return v; });')).to.have.no.errors();
    });
});
