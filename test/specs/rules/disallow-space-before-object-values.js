var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpaceBeforeObjectValues: true });
    });

    it('should report with space after keys colons', function() {
        expect(checker.checkString('var x = { a:1, b: 2 };')).to.have.one.validation.error();
        expect(checker.checkString('var x = { abc : 1, b: 2 };'))
            .to.have.validation.error.count.which.equals(2);
        expect(checker.checkString('var x = { abc:(true), z: (function() { return _z > 0; }) };'))
            .to.have.one.validation.error();
        expect(checker.checkString('var x = { abc : (true), b: ("1")};'))
            .to.have.validation.error.count.which.equals(2);
        expect(checker.checkString('var x = { a: ((1 > 2) && 3)};')).to.have.one.validation.error();
    });

    it('should not report with no space after keys colons and parenthesised expression in property value', function() {
        expect(checker.checkString('var x = { a:(1 > 2)};')).to.have.no.errors();
        expect(checker.checkString('var x = { 0x7f   :(y?(z ? 1: 2):(3)) };')).to.have.no.errors();
        expect(checker.checkString('var x = { a:((1 > 2) && 3)};')).to.have.no.errors();
        expect(checker.checkString('var x = { a     :((  1 > 2) && 3)};')).to.have.no.errors();
    });

    it('should not report with no space after keys colons', function() {
        expect(checker.checkString('var x = { a:1, bcd :2 };')).to.have.no.errors();
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
        expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
    });

    it('should report mixed shorthand and normal object propertis', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a : 1, b };')).to.have.one.validation.error();
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
