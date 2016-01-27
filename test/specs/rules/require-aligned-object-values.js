var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-aligned-object-values', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('all option', function() {
        var rules = { requireAlignedObjectValues: 'all' };
        beforeEach(function() {
            checker.configure(rules);
        });

        it('should not report for empty object', function() {
            expect(checker.checkString('var x = {};')).to.have.no.errors();
        });

        it('should not report for single-line object', function() {
            expect(checker.checkString('var x = {a: 1, bcd: 2};')).to.have.no.errors();
        });

        it('should not report if aligned', function() {
            expect(checker.checkString(
                    'var x = {\n' +
                        'a   : 1,\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        it('should not report shorthand properties', function() {
            expect(checker.checkString(
                    'var x = {\n' +
                        'bcd : 2,\n' +
                        'a,\n' +
                        'efg : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        it('should not report es6-methods. #1013', function() {
            expect(checker.checkString('var x = { a() { } };')).to.have.no.errors();
        });

        it('should not report es5 getters/setters #1037', function() {
            expect(checker.checkString('var x = { get a() { } };')).to.have.no.errors();
            expect(checker.checkString('var x = { set a(val) { } };')).to.have.no.errors();
        });

        it('should not report if aligned with computed property names #1404', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey]: "myOtherValue"',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

        it('should report invalid alignment', function() {
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.one.validation.error.from('requireAlignedObjectValues');
        });

        it('should report if not aligned with computed property names #1404', function() {
            expect(checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey] : "myOtherValue"',
                    '};'
                ].join('\n'))).to.have.one.validation.error.from('requireAlignedObjectValues');
        });

        it('should not report on an import plus aligned computed property names (#1587)', function() {
            expect(checker.checkString([
                    'import React, {PropTypes} from \'react\';\n',
                    'import {ImmutableComponentPure} from \'common/ImmutableComponent.js\'',
                    'let myObject = {',
                      '[myKey]     : "myKeyValue",',
                      '[$main.pod] : "myOtherValue"',
                    '};'
                ].join('\n'))).to.have.no.errors();
        });

        it('should not report es7 object spread. Ref #1624', function() {
            expect(checker.checkString(
                    'var x = {\n' +
                        'bcd : 2,\n' +
                        '...a,\n' +
                        'efg : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        describe('alignment check for any number of spaces', function() {
            reportAndFix({
                name: 'illegal object values alignment',
                rules: rules,
                input: 'var x = {\n' +
                    'a: 1,\n' +
                    '\n' +
                    'foo: function() {},\n' +
                    'bcd: 2\n' +
                '};',
                output: 'var x = {\n' +
                    'a  : 1,\n' +
                    '\n' +
                    'foo: function() {},\n' +
                    'bcd: 2\n' +
                '};'
            });
            reportAndFix({
                name: 'illegal object values alignment',
                rules: rules,
                input: 'var x = {\n' +
                    'a      : 1,\n' +
                    '\n' +
                    'foo   : function() {},\n' +
                    'bcd   : 2\n' +
                '};',
                output: 'var x = {\n' +
                    'a     : 1,\n' +
                    '\n' +
                    'foo   : function() {},\n' +
                    'bcd   : 2\n' +
                '};'
            });
        });

        describe.skip('in conjunction with disallowSpaceAfterObjectKeys', function() {
            reportAndFix({
                name: 'illegal object values alignment',
                rules: {
                    disallowSpaceAfterObjectKeys: {allExcept: ['aligned']},
                    requireAlignedObjectValues: 'all'
                },
                errors: 4,
                input: 'var x = {\n' +
                    'a : 1,\n' +
                    'foo : function() {},\n' +
                    'bcd : 2\n' +
                '};',
                output: 'var x = {\n' +
                    'a: 1,\n' +
                    'foo: function() {},\n' +
                    'bcd: 2\n' +
                '};'
            });
        });
    });

    describe('ignoreFunction option', function() {
        it('should not report function with skipWithFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithFunction' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        it('should not report function with ignoreFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreFunction' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.no.errors();
        });
    });

    describe('ignoreLineBreak option', function() {
        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'nested : {\n' +
                            'sdf : \'sdf\',\n' +
                            'e : 1\n' +
                        '},\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.one.validation.error.from('requireAlignedObjectValues');
        });

        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.no.errors();
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            expect(checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'nested : {\n' +
                            'sdf : \'sdf\',\n' +
                            'e : 1\n' +
                        '},\n' +
                        'bcd : 2\n' +
                    '};'
                )).to.have.one.validation.error.from('requireAlignedObjectValues');
        });
    });

    describe('incorrect configuration', function() {
        it('should not accept objects without correct key', function() {
            expect(function() {
                    checker.configure({ requireAlignedObjectValues: 'skipsWithFunction' });
                }).to.throw('AssertionError');
        });
    });
});
