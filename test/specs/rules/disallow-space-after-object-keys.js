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

        it('should not report if no space after computed property names #1406', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]: "myKeyValue",',
                      '[otherKey]: "myOtherValue"',
                    '};'
                ].join('\n')).isEmpty()
            );
        });

        it('should report if space after computed property names #1406', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey] : "myKeyValue"',
                    '};'
                ].join('\n')).getErrorCount() === 1
            );
        });

        it('should report mixed shorthand and normal object properties', function() {
            checker.configure({ esnext: true });
            assert.equal(checker.checkString('var x = { a : 1, b };').getErrorCount(), 1);
        });
    });

    describe('options as object', function() {
        describe('allExcept option', function() {
            describe('with singleline value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['singleline'] } });
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

            describe('with multliline value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['multiline'] } });
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

            describe('with aligned value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['aligned'] } });
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

            it('should not accept multiline and aligned at the same time', function() {
                var rules = {disallowSpaceAfterObjectKeys: {allExcept: ['multiline', 'aligned']}};
                assert.throws(function() {
                    checker.configure(rules);
                }, assert.AssertionError);
            });

            it('should not accept multiline and singleline at the same time', function() {
                var rules = {disallowSpaceAfterObjectKeys: {allExcept: ['singleline', 'multiline']}};
                assert.throws(function() {
                    checker.configure(rules);
                }, assert.AssertionError);
            });
        });
    });

    describe('legacy options', function() {
        it('should accept ignoreSingleLine as an option', function() {
            checker.configure({disallowSpaceAfterObjectKeys: 'ignoreSingleLine'});
            assert(checker.checkString('var x = {a : 1, bcd : 2};').isEmpty());
        });

        it('should accept ignoreMultiLine as an option', function() {
            checker.configure({disallowSpaceAfterObjectKeys: 'ignoreMultiLine'});
            assert(checker.checkString(
                'var x = {\n' +
                'a : 1,\n' +
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

        it('should allow object literal spreading with spread at end', function() {
            assert(checker.checkString(
                'var b = {};\n' +
                'var x = {a: 1, ...b};'
            ).isEmpty());
        });

        it('should allow object literal spreading with spread at beginning', function() {
            assert(checker.checkString(
                'var b = {};\n' +
                'var x = {...b, a: 1};'
            ).isEmpty());
        });
    });
});
