var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-space-after-object-keys', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireSpaceAfterObjectKeys: true });
    });

    it('should report missing space after keys', function() {
        assert(checker.checkString('var x = { a : 1, b: 2 };').getErrorCount() === 1);
        assert(checker.checkString('var x = { abc: 1, b: 2 };').getErrorCount() === 2);
    });

    it('should not report space after keys', function() {
        assert(checker.checkString('var x = { a : 1, bcd : 2 };').isEmpty());
    });

    it('should not report shorthand object properties', function() {
        checker.configure({ esnext: true });
        assert(checker.checkString('var x = { a, b };').isEmpty());
        assert(checker.checkString('var x = {a, b};').isEmpty());
    });

    it('should report mixed shorthand and normal object properties', function() {
        checker.configure({ esnext: true });
        assert.equal(checker.checkString('var x = { a:1, b };').getErrorCount(), 1);
    });

    it('should not report es5 getters/setters #1037', function() {
        assert(checker.checkString('var x = { get a() { } };').isEmpty());
        assert(checker.checkString('var x = { set a(val) { } };').isEmpty());
    });

    describe('es6', function() {
        beforeEach(function() {
            checker.configure({ esnext: true });
        });

        it('should allow object literal spreading with spread at end', function() {
            assert(checker.checkString(
                'var b = {};\n' +
                'var x = {a : 1, ...b};'
            ).isEmpty());
        });

        it('should allow object literal spreading with spread at beginning', function() {
            assert(checker.checkString(
                'var b = {};\n' +
                'var x = {...b, a : 1};'
            ).isEmpty());
        });

        it('should report es6-methods without a space. #1013', function() {
            assert(checker.checkString('var x = { a() { } };').getErrorCount() === 1);
        });

        it('should not report es6-methods with a space. #1013', function() {
            assert(checker.checkString('var x = { a () { } };').isEmpty());
        });

        it('should report if no space after computed property names #1406', function() {
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]: "myKeyValue"',
                    '};'
                ].join('\n')).getErrorCount() === 1
            );
        });

        it('should not report if space after computed property names #1406', function() {
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey] : "myKeyValue",',
                      '[otherKey] : "myOtherValue"',
                    '};'
                ].join('\n')).isEmpty()
            );
        });

    });

});
