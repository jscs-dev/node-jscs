var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-padding-newlines-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesInObjects: true });
    });

    it('should report existing newline after opening brace', function() {
        expect(checker.checkString('var x = {\na: 1};'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesInObjects');
    });
    it('should report existing newline before closing brace', function() {
        expect(checker.checkString('var x = {a: 1\n};'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesInObjects');
    });
    it('should report existing newline in both cases', function() {
        expect(checker.checkString('var x = {\na: 1\n};')).to.have.error.count.equal(2);
    });
    it('should not report with no newlines', function() {
        expect(checker.checkString('var x = {a: 1};')).to.have.no.errors();
        expect(checker.checkString('var x = { a: 1 };')).to.have.no.errors();
    });
    it('should not report for empty object', function() {
        expect(checker.checkString('var x = {};')).to.have.no.errors();
    });
    it('should report for nested object', function() {
        expect(checker.checkString('var x = { a: {\nb: 1\n} };')).to.have.error.count.equal(2);
    });
});
