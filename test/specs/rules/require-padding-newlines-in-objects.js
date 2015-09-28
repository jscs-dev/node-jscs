var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-padding-newlines-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLinesInObjects: true });
    });

    it('should report missing newline after opening brace', function() {
        expect(checker.checkString('var x = {a: 1\n};'))
          .to.have.one.validation.error.from('requirePaddingNewLinesInObjects');
        expect(checker.checkString('var x = { a: 1\n};'))
          .to.have.one.validation.error.from('requirePaddingNewLinesInObjects');
    });
    it('should report missing newline before closing brace', function() {
        expect(checker.checkString('var x = {\na: 1};'))
          .to.have.one.validation.error.from('requirePaddingNewLinesInObjects');
        expect(checker.checkString('var x = {\na: 1 };'))
          .to.have.one.validation.error.from('requirePaddingNewLinesInObjects');
    });
    it('should report missing newline in both cases', function() {
        expect(checker.checkString('var x = {a: 1};')).to.have.error.count.equal(2);
        expect(checker.checkString('var x = { a: 1 };')).to.have.error.count.equal(2);
    });
    it('should not report with newlines', function() {
        expect(checker.checkString('var x = {\na: 1\n};')).to.have.no.errors();
    });
    it('should not report for empty object', function() {
        expect(checker.checkString('var x = {};')).to.have.no.errors();
    });
    it('should report for nested object', function() {
        expect(checker.checkString('var x = {\na: { b: 1 }\n};')).to.have.error.count.equal(2);
    });
});
