var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-quoted-keys-in-objects', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: true });
    });

    it('should report if key is valid without quotes', function() {
        expect(checker.checkString('var x = { "a": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "A": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "_abc": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "_a1": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "_abc_": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "a_a": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "12": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "$1": 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { "a$b": 1 }'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report for keys without quotes', function() {
        expect(checker.checkString('var x = { a: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { B: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { _a: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { _abc_: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { _a1: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { a_a: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { 12: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { $: 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { 0: 1 }')).to.have.no.errors();
    });

    it('should not report if key is invalid without quotes', function() {
        expect(checker.checkString('var x = { "": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a 1": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a  a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a-a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a+a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { ".": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a..a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a/a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "1a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "1$": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "010": 1 }')).to.have.no.errors();
    });

    it('should check all keys in object', function() {
        expect(checker.checkString('var x = { "a": 1, b: 2, "3": 3 }')).to.have.validation.error.count.which.equals(2);
    });

    it('should not report if reserved words when "allButReserved" mode is used', function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: 'allButReserved' });

        expect(checker.checkString('var x = { "default": 1, "class": "foo" }')).to.have.no.errors();
        expect(checker.checkString('var x = { "true": 1, "false": "foo" }')).to.have.no.errors();
    });

    it('does not report for "null" when "allButReserved" mode is used', function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowQuotedKeysInObjects: 'allButReserved' });

        expect(checker.checkString('var x = { "null": 1, undefined: "foo" }')).to.have.no.errors();
    });
});
