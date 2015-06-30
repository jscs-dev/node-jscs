var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-space-before-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceBeforeObjectValues: true });
    });

    it('should report with no space after keys colons', function() {
        assert.equal(checker.checkString('var x = { a:1, b: 2 };').getValidationErrorCount(), 1, 'one error is found');
        assert.equal(checker.checkString('var x = { abc :1, b:2 };').getValidationErrorCount(), 2, 'two errors are found');
    });

    it('should not report with parenthesised property value', function() {
        expect(checker.checkString('var data = { key: (x > 2) };')).to.have.no.errors();
        expect(checker.checkString('var video = { isFullHD: ((width > 1920) && (height > 1080)) };')).to.have.no.errors();
        expect(checker.checkString('var data = { key:    (    (   ( ( 2 ))))};')).to.have.no.errors();
    });

    it('should not report with array initializer as property value', function() {
        expect(checker.checkString('var jsFiles = { src: ["*.js"] }')).to.have.no.errors();
    });

    it('should not report with nested objects', function() {
        expect(checker.checkString('var foo = { bar: { baz: 127 } };')).to.have.no.errors();
    });

    it('should not report with end of line after keys colons', function() {
        assert(checker.checkString(
            'var x = {\n' +
            '   a:\n' +
            '   2\n' +
            '}'
        ).isEmpty());
    });

    it('should not report with space after keys colons', function() {
        expect(checker.checkString('var x = { a: 1, bcd: 2 };')).to.have.no.errors();
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
        expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
    });

    it('should report mixed shorthand and normal object propertis', function() {
        checker.configure({ esnext: true });
        assert.equal(checker.checkString('var x = { a:1, b };').getValidationErrorCount(), 1);
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
