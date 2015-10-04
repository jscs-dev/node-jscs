var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-space-before-semicolon', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            expect(function() {
                    checker.configure({ disallowSpaceBeforeSemicolon: {} });
                }).to.throw('AssertionError');
        });

        it('should not accept non-boolean non-objects', function() {
            expect(function() {
                    checker.configure({ disallowSpaceBeforeSemicolon: 'true' });
                }).to.throw('AssertionError');
        });
    });

    it('does not allow spaces before semicolons', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        expect(checker.checkString('; ;')).to.have.one.validation.error.from('disallowSpaceBeforeSemicolon');
        expect(checker.checkString('var a = 1 ;')).to.have.one.validation.error.from('disallowSpaceBeforeSemicolon');
        expect(checker.checkString('var a = 2  ;')).to.have.one.validation.error.from('disallowSpaceBeforeSemicolon');
    });

    it('does allow semicolons with no spaces', function() {
        checker.configure({ disallowSpaceBeforeSemicolon: true });

        expect(checker.checkString('var a = 1;')).to.have.no.errors();
    });

    it('should allow space after parentheses', function() {
        checker.configure({
            disallowSpaceBeforeSemicolon: {
                allExcept: ['(']
            }
        });

        expect(checker.checkString('for ( ; nodeIndex < nodesCount; ++nodeIndex ) {}')).to.have.no.errors();
    });

    it('should not trigger error if semicolon is first token', function() {
        checker.configure({
            disallowSpaceBeforeSemicolon: true
        });

        expect(checker.checkString(';')).to.have.no.errors();
    });
});
