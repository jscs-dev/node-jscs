var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-quoted-keys-in-objects', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireQuotedKeysInObjects: true });
    });

    it('should report for object keys without quotes', function() {
        expect(checker.checkString('var x = { a: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { B: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { _a: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { _abc_: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { _a1: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { a_a: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { 12: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { $: 1 }'))
            .to.have.one.error.from('ruleName');
        expect(checker.checkString('var x = { 0: 1 }'))
            .to.have.one.error.from('ruleName');
    });

    it('should not report if the key is surrounded by quotes', function() {
        expect(checker.checkString('var x = { "a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "A": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "_abc": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "_a1": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "_abc_": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a_a": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "12": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "$1": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "a$b": 1 }')).to.have.no.errors();
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
        expect(checker.checkString('var x = { "6b2ea258-cf24-44fe-b857-c4e37e105d6f": 1 }')).to.have.no.errors();
        expect(checker.checkString('var x = { "default": 1, "class": "foo" }')).to.have.no.errors();
        expect(checker.checkString('var x = { "null": 1, "undefined": "foo" }')).to.have.no.errors();
    });

    it('should check all keys in object', function() {
        expect(checker.checkString('var x = { a: 1, "b": 2, c: 3 }')).to.have.validation.error.count.which.equals(2);
    });

    it('should correctly identify the error', function() {
        var errors = checker.checkString('var x = { a: 1 }');
        expect(errors)
            .to.have.one.error.from('ruleName');

        var error = errors.getErrorList()[0];
        expect(error.message).to.equal('Object key without surrounding quotes');
        expect(error.line).to.equal(1);
        expect(error.column).to.equal(10);
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
    });

    it('should not report es6-methods. #1013', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
    });

    it('should not report es5 getters/setters #1037', function() {
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });
});
