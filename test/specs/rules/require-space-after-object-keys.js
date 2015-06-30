var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterObjectKeys: true });
    });

    it('should report missing space after keys', function() {
        expect(checker.checkString('var x = { a : 1, b: 2 };'))
            .to.have.one.error.from('ruleName');
        assert(checker.checkString('var x = { abc: 1, b: 2 };').getValidationErrorCount() === 2);
    });

    it('should not report space after keys', function() {
        expect(checker.checkString('var x = { a : 1, bcd : 2 };')).to.have.no.errors();
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
        expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
    });

    it('should report mixed shorthand and normal object properties', function() {
        checker.configure({ esnext: true });
        assert.equal(checker.checkString('var x = { a:1, b };').getValidationErrorCount(), 1);
    });

    it('should not report es5 getters/setters #1037', function() {
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });

    describe.skip('es6', function() {
        beforeEach(function() {
            checker.configure({ esnext: true });
        });

        it('should report es6-methods without a space. #1013', function() {
            expect(checker.checkString('var x = { a() { } };'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report es6-methods with a space. #1013', function() {
            expect(checker.checkString('var x = { a () { } };')).to.have.no.errors();
        });
    });

});
