var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('true option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: true });
        });

        it('should report with space(s) after keys', function() {
            expect(checker.checkString('var x = { a : 1, b: 2 };'))
            .to.have.one.error.from('ruleName');
            assert(checker.checkString('var x = { abc : 1, b  : 2 };').getValidationErrorCount() === 2);
        });

        it('should report with end of line after keys', function() {
            assert(checker.checkString(
                'var x = {' +
                '   a\n' +
                '      :\n' +
                '   2\n' +
                '}'
            ).getValidationErrorCount() === 1);
        });

        it('should not report without space after keys', function() {
            expect(checker.checkString('var x = { a: 1, bcd: 2 };')).to.have.no.errors();
        });

        it('should not report shorthand object properties', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
            expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
        });

        it('should report mixed shorthand and normal object propertis', function() {
            checker.configure({ esnext: true });
            assert.equal(checker.checkString('var x = { a : 1, b };').getValidationErrorCount(), 1);
        });
    });

    describe.skip('ignoreSingleLine option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: 'ignoreSingleLine' });
        });

        it('should not report with an object that takes up a single line', function() {
            expect(checker.checkString('var x = {a : 1, bcd : 2};')).to.have.no.errors();
        });

        it('should report with an object that takes up a multi line', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'a : 1,\n' +
                '};'
            ).getValidationErrorCount() === 1);
        });
    });

    describe.skip('ignoreMultiLine option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: 'ignoreMultiLine' });
        });

        it('should report with an object that takes up a single line', function() {
            assert(checker.checkString('var x = {a : 1, bcd : 2};').getValidationErrorCount() === 2);
        });

        it('should not report with an object that takes up a multi line', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'a : 1,\n' +
                '};'
            ).isEmpty());
        });
    });

    it('should not report es5 getters/setters #1037', function() {
        checker.configure({ disallowSpaceAfterObjectKeys: true });
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });

    describe.skip('es6', function() {
        beforeEach(function() {
            checker.configure({ esnext: true, disallowSpaceAfterObjectKeys: true });
        });

        it('should not report es6-methods without a space. #1013', function() {
            expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
        });

        it('should report es6-methods with a space. #1013', function() {
            expect(checker.checkString('var x = { a () { } };'))
            .to.have.one.error.from('ruleName');
        });

    });
});
