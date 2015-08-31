var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-template-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireTemplateStrings: true });
    });

    it('should report the use of string concatenation with a identifier on the left', function() {
        expect(checker.checkString('a + "a"'))
            .to.have.one.error.from('ruleName');
    });

    it('should report the use of string concatenation with a identifier on the right', function() {
        expect(checker.checkString('"a" + a'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report the use of string concatenation with a identifier on the left and right', function() {
        expect(checker.checkString('a + a')).to.have.no.errors();
    });

    it('should not report the use of string concatenation with two literals', function() {
        expect(checker.checkString('"a" + "a"')).to.have.no.errors();
    });

    it('should not report the use of template strings', function() {
        expect(checker.checkString('`How are you, ${name}?`')).to.have.no.errors();
    });

    it('should report the use of string concatenation with right handed binary expression',
        function() {
            expect(checker.checkString('"test" + (a + b)'))
            .to.have.one.error.from('ruleName');
        }
    );

    it('should report the use of string concatenation with left handed binary expression',
        function() {
            expect(checker.checkString('(a + b) + "test"'))
            .to.have.one.error.from('ruleName');
        }
    );

    it('should not report for number literals', function() {
        expect(checker.checkString('1 + a')).to.have.no.errors();
        expect(checker.checkString('a + 1')).to.have.no.errors();
    });

    it('should not report for null literal', function() {
        expect(checker.checkString('null + a')).to.have.no.errors();
        expect(checker.checkString('a + null')).to.have.no.errors();
    });

    it('should not report for true literal', function() {
        expect(checker.checkString('true + a')).to.have.no.errors();
        expect(checker.checkString('a + false')).to.have.no.errors();
    });

    it('should not report for binary expression that isn\'t +', function() {
        expect(checker.checkString('1 * 2')).to.have.no.errors();
        expect(checker.checkString('a === b')).to.have.no.errors();
    });
});
