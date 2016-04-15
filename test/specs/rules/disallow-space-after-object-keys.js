var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('var x = { a : 1, b: 2 };'))
              .to.have.one.validation.error.from('disallowSpaceAfterObjectKeys');
            expect(checker.checkString('var x = { abc : 1, b  : 2 };')).to.have.error.count.equal(2);
        });

        it('should report with end of line after keys', function() {
            expect(checker.checkString(
                'var x = {' +
                '   a\n' +
                '      :\n' +
                '   2\n' +
                '}'
            )).to.have.one.validation.error.from('disallowSpaceAfterObjectKeys');
        });

        it('should not report without space after keys', function() {
            expect(checker.checkString('var x = { a: 1, bcd: 2 };')).to.have.no.errors();
        });

        it('should not report shorthand object properties', function() {
            expect(checker.checkString('var x = { a, b };')).to.have.no.errors();
            expect(checker.checkString('var x = {a, b};')).to.have.no.errors();
        });

        it('should not report if no space after computed property names #1406', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey]: "myKeyValue",',
                      '[otherKey]: "myOtherValue"',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

        it('should not report if no space after computed property names #1742', function() {
            expect(checker.checkString([
                    'var a = {',
                      '[block + \'--default\']: this.props.navStyle === \'default\',',
                      '[1 + 1 + 3]: 1',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

        it('should report if space after computed property names #1406', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey] : "myKeyValue"',
                    '};'
                ].join('\n'))).to.have.one.validation.error.from('disallowSpaceAfterObjectKeys');
        });

        it('should report if space after computed property names #1742', function() {
            expect(checker.checkString([
                    'var a = {',
                      '[block + \'--default\'] : this.props.navStyle === \'default\',',
                      '[1 + 1 + 3] : 1',
                    '};'
                ].join('\n'))).to.have.error.count.equal(2);
        });

        it('should report mixed shorthand and normal object properties', function() {
            expect(checker.checkString('var x = { a : 1, b };'));
        });
    });

    describe('options as object', function() {
        describe('allExcept option', function() {
            describe('with singleline value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['singleline'] } });
                });

                it('should not report with an object that takes up a single line', function() {
                    expect(checker.checkString('var x = {a : 1, bcd : 2};')).to.have.no.errors();
                });

                it('should report with an object that takes up a multi line', function() {
                    expect(checker.checkString(
                            'var x = {\n' +
                            'a : 1,\n' +
                            '};'
                        )).to.have.one.validation.error.from('disallowSpaceAfterObjectKeys');
                });
            });

            describe('with multliline value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['multiline'] } });
                });

                it('should report with an object that takes up a single line', function() {
                    expect(checker.checkString('var x = {a : 1, bcd : 2};')).to.have.error.count.equal(2);
                });

                it('should not report with an object that takes up a multi line', function() {
                    expect(checker.checkString(
                        'var x = {\n' +
                        'a : 1,\n' +
                        '};'
                    )).to.have.no.errors();
                });
            });

            describe('with aligned value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['aligned'] } });
                });

                it('should report with an object that takes up a single line', function() {
                    expect(checker.checkString('var x = {a : 1, bcd : 2};')).to.have.error.count.equal(2);
                });

                it('should report with an aligned multiline object with space after keys', function() {
                    expect(checker.checkString(
                            'var x = {\n' +
                            'bcd :2,\n' +
                            'a   : 1,\n' +
                            '};'
                        )).to.have.error.count.equal(2);
                });

                it('should not report with an aligned multiline object without space after keys', function() {
                    expect(checker.checkString(
                        'var x = {\n' +
                        'bcd:2,\n' +
                        'a  : 1,\n' +
                        '};'
                    )).to.have.no.errors();
                });

                it('should not report keys with no space after them #1818', function() {
                    expect(checker.checkString(
                        'var f = {\n' +
                        '  "name": 1,\n' +
                        '  "x": 2\n' +
                        '};'
                    )).to.have.no.errors();
                });

                it('should report objects with both keys without spaces and aligned on colon #1818', function() {
                    expect(checker.checkString(
                      'var f = {\n' +
                      '  "n": 1,\n' +
                      '  "xasdf"   : 2,\n' +
                      '  "fyfyasdf": 0\n' +
                      '};'
                    )).to.have.error.count.equal(1);
                });
            });

            describe('with method value', function() {
                beforeEach(function() {
                    checker.configure({ disallowSpaceAfterObjectKeys: { allExcept: ['method'] } });
                });

                it('should report with a function that is written in method notation', function() {
                    expect(checker.checkString('var x = {fn () {return 42;}};')).to.have.no.errors();
                });
            });

            it('should not accept multiline and aligned at the same time', function() {
                var rules = {disallowSpaceAfterObjectKeys: {allExcept: ['multiline', 'aligned']}};
                expect(function() {
                    checker.configure(rules);
                }).to.throw('AssertionError');
            });

            it('should not accept multiline and singleline at the same time', function() {
                var rules = {disallowSpaceAfterObjectKeys: {allExcept: ['singleline', 'multiline']}};
                expect(function() {
                    checker.configure(rules);
                }).to.throw('AssertionError');
            });
        });
    });

    describe('legacy options', function() {
        it('should accept ignoreSingleLine as an option', function() {
            checker.configure({disallowSpaceAfterObjectKeys: 'ignoreSingleLine'});
            expect(checker.checkString('var x = {a : 1, bcd : 2};')).to.have.no.errors();
        });

        it('should accept ignoreMultiLine as an option', function() {
            checker.configure({disallowSpaceAfterObjectKeys: 'ignoreMultiLine'});
            expect(checker.checkString(
                'var x = {\n' +
                'a : 1,\n' +
                '};'
            )).to.have.no.errors();
        });
    });

    it('should not report es5 getters/setters #1037', function() {
        checker.configure({ disallowSpaceAfterObjectKeys: true });
        expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
        expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
    });

    describe('es6', function() {
        beforeEach(function() {
            checker.configure({ disallowSpaceAfterObjectKeys: true });
        });

        it('should not report es6-methods without a space. #1013', function() {
            expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
        });

        it('should report es6-methods with a space. #1013', function() {
            expect(checker.checkString('var x = { a () { } };'))
              .to.have.one.validation.error.from('disallowSpaceAfterObjectKeys');
        });

        it('should allow object literal spreading with spread at end', function() {
            expect(checker.checkString(
                'var b = {};\n' +
                'var x = {a: 1, ...b};'
            )).to.have.no.errors();
        });

        it('should allow object literal spreading with spread at beginning', function() {
            expect(checker.checkString(
                'var b = {};\n' +
                'var x = {...b, a: 1};'
            )).to.have.no.errors();
        });
    });
});
