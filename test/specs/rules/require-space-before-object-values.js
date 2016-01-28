var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeObjectValues: true });
    });

    it('should report with no space after keys colons', function() {
        expect(checker.checkString('var x = { a:1, b: 2 };'))
          .to.have.one.validation.error.from('requireSpaceBeforeObjectValues');
        expect(checker.checkString('var x = { abc :1, b:2 };')).to.have.error.count.equal(2);
    });

    it('should not report with parenthesised property value', function() {
        expect(checker.checkString('var data = { key: (x > 2) };')).to.have.no.errors();
        expect(checker.checkString('var video = { isFullHD: ((width > 1920) && (height > 1080)) };'))
          .to.have.no.errors();
        expect(checker.checkString('var data = { key:    (    (   ( ( 2 ))))};')).to.have.no.errors();
    });

    it('should not report with array initializer as property value', function() {
        expect(checker.checkString('var jsFiles = { src: ["*.js"] }')).to.have.no.errors();
    });

    it('should not report with nested objects', function() {
        expect(checker.checkString('var foo = { bar: { baz: 127 } };')).to.have.no.errors();
    });

    it('should not report with end of line after keys colons', function() {
        expect(checker.checkString(
            'var x = {\n' +
            '   a:\n' +
            '   2\n' +
            '}'
        )).to.have.no.errors();
    });

    it('should allow object literal spreading with spread at end', function() {
        checker.configure({ requireSpaceBeforeObjectValues: true });
        expect(checker.checkString(
            'var b = {};\n' +
            'var x = {a: 1, ...b};'
        )).to.have.no.errors();
    });

    it('should allow object literal spreading with spread at beginning', function() {
        checker.configure({ requireSpaceBeforeObjectValues: true });
        expect(checker.checkString(
            'var b = {};\n' +
            'var x = {...b, a: 1};'
        )).to.have.no.errors();
    });

    it('should not report with space after keys colons', function() {
        expect(checker.checkString('var x = { a: 1, bcd: 2 };')).to.have.no.errors();
    });

    it('should not report shorthand object properties', function() {
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
        expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
    });

    it('should report mixed shorthand and normal object properties', function() {
        expect(checker.checkString('var x = { a:1, b };'))
          .to.have.one.validation.error.from('requireSpaceBeforeObjectValues');
    });

    it('should not report es6-methods. #1013', function() {
        expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
    });

    it('should not report es5 getters/setters #1037', function() {
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });
});
