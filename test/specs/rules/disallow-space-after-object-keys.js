var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: true });
        });

        it('should report with space(s) after keys', function() {
            assert(checker.checkString('var x = { a : 1, b: 2 };').getErrorCount() === 1);
            assert(checker.checkString('var x = { abc : 1, b  : 2 };').getErrorCount() === 2);
        });

        it('should report with end of line after keys', function() {
            assert(checker.checkString(
                'var x = {' +
                '   a\n' +
                '      :\n' +
                '   2\n' +
                '}'
            ).getErrorCount() === 1);
        });

        it('should not report without space after keys', function() {
            assert(checker.checkString('var x = { a: 1, bcd: 2 };').isEmpty());
        });

        it('should not report shorthand object properties', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('var x = { a, b };').isEmpty());
            assert(checker.checkString('var x = {a, b};').isEmpty());
        });

        it('should report mixed shorthand and normal object propertis', function() {
            checker.configure({ esnext: true });
            assert.equal(checker.checkString('var x = { a : 1, b };').getErrorCount(), 1);
        });
    });

    describe('ignoreSingleLine option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: 'ignoreSingleLine' });
        });

        it('should not report with an object that takes up a single line', function() {
            assert(checker.checkString('var x = {a : 1, bcd : 2};').isEmpty());
        });

        it('should report with an object that takes up a multi line', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'a : 1,\n' +
                '};'
            ).getErrorCount() === 1);
        });
    });

    describe('ignoreMultiLine option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: 'ignoreMultiLine' });
        });

        it('should report with an object that takes up a single line', function() {
            assert(checker.checkString('var x = {a : 1, bcd : 2};').getErrorCount() === 2);
        });

        it('should not report with an object that takes up a multi line', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'a : 1,\n' +
                '};'
            ).isEmpty());
        });
    });

    describe('ignoreAligned option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: 'ignoreAligned' });
        });

        it('should report with an object that takes up a single line', function() {
            assert(checker.checkString('var x = {a : 1, bcd : 2};').getErrorCount() === 2);
        });

        it('should report with an aligned multiline object with space after keys', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'bcd :2,\n' +
                    'a   : 1,\n' +
                '};'
            ).getErrorCount() === 2);
        });

        it('should not report with an aligned multiline object without space after keys', function() {
            assert(checker.checkString(
                'var x = {\n' +
                    'bcd:2,\n' +
                    'a  : 1,\n' +
                '};'
            ).isEmpty());
        });
    });

    it('should not report es5 getters/setters #1037', function() {
        checker.configure({ disallowSpaceAfterObjectKeys: true });
        assert(checker.checkString('var x = { get a() { } };').isEmpty());
        assert(checker.checkString('var x = { set a(val) { } };').isEmpty());
    });

    describe('es6', function() {
        beforeEach(function() {
            checker.configure({ esnext: true, disallowSpaceAfterObjectKeys: true });
        });

        it('should not report es6-methods without a space. #1013', function() {
            assert(checker.checkString('var x = { a() { } };').isEmpty());
        });

        it('should report es6-methods with a space. #1013', function() {
            assert(checker.checkString('var x = { a () { } };').getErrorCount() === 1);
        });

    });
});
