var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-aligned-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('all option', function() {
        beforeEach(function() {
            checker.configure({ requireAlignedObjectValues: 'all' });
        });

        it('should not report for empty object', function() {
            expect(checker.checkString('var x = {};')).to.have.no.errors();
        });

        it('should not report for single-line object', function() {
            expect(checker.checkString('var x = {a: 1, bcd: 2};')).to.have.no.errors();
        });

        it('should not report if aligned', function() {
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a   : 1,\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should not report shorthand properties', function() {
            checker.configure({ esnext: true });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'bcd : 2,\n' +
                        'a,\n' +
                        'efg : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should not report es6-methods. #1013', function() {
            checker.configure({ esnext: true });
            expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
        });

        it('should not report es5 getters/setters #1037', function() {
            expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
            expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
        });

        it('should not report if aligned with computed property names #1404', function() {
            checker.configure({ esnext: true });
            expect(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey]: "myOtherValue"',
                    '};'
                ].join('\n'))
            ).to.have.no.errors();
        });

        it('should report invalid alignment', function() {
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.one.validation.error();
        });

        it('should report if not aligned with computed property names #1404', function() {
            checker.configure({ esnext: true });
            expect(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey] : "myOtherValue"',
                    '};'
                ].join('\n'))
            ).to.have.one.validation.error();
        });
    });

    describe.skip('ignoreFunction option', function() {
        it('should not report function with skipWithFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithFunction' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should not report function with ignoreFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreFunction' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });
    });

    describe.skip('ignoreLineBreak option', function() {
        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'nested : {\n' +
                            'sdf : \'sdf\',\n' +
                            'e : 1\n' +
                        '},\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.one.validation.error();
        });

        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.no.errors();
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            expect(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'nested : {\n' +
                            'sdf : \'sdf\',\n' +
                            'e : 1\n' +
                        '},\n' +
                        'bcd : 2\n' +
                    '};'
                )
            ).to.have.one.validation.error();
        });
    });
});
