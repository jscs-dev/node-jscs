var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-multi-line-ternary', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowMultiLineTernary: true });
    });

    it('should not allow ternary with test on it\'s own line', function() {
        expect(checker.checkString('var foo = (a === b)\n ? 1 : 2;'))
          .to.have.one.validation.error.from('disallowMultiLineTernary');
    });

    it('should not allow ternary with alternate on it\'s own line', function() {
        expect(checker.checkString('var foo = (a === b) ? 1\n : 2;'))
          .to.have.one.validation.error.from('disallowMultiLineTernary');
    });

    it('should not allow ternary with separate lines for test, consequent and alterntative', function() {
        expect(checker.checkString('var foo = (a === b)\n ? 1\n : 2;')).to.have.error.count.equal(2);
    });

    it('should not allow multi-line nested ternary', function() {
        expect(checker.checkString(
            'var foo = (a === b)\n' +
            '    ? (x > y)\n' +
            '        ? 1\n' +
            '        : 2\n' +
            '    : (c === d)\n' +
            '        ? 3\n' +
            '        : 4;'
        )).to.have.error.count.equal(6);
    });

    it('should report correct amount of errors for nesting single line ternaries in multi-line ternaries', function() {
        expect(checker.checkString(
            'var foo = (a === b)\n' +
            '    ? (x > y) ? 1 : 2\n' +
            '    : (c === d) ? 3 : 4;'
        )).to.have.error.count.equal(2);
    });

    it('should allow single line ternary', function() {
        expect(checker.checkString('var foo = (a === b) ? 1 : 2;')).to.have.no.errors();
    });

    it('should allow single line nested ternary', function() {
        expect(checker.checkString(
            'var foo = (a === b) ? (x > y) ? 1 : 2 : (c === d) ? 3 : 4;'
        )).to.have.no.errors();
    });

    describe('incorrect configuration', function() {
        it('should not accept objects', function() {
            expect(function() {
                    checker.configure({ disallowMultiLineTernary: {} });
                }).to.throw('AssertionError');
        });
    });
});
