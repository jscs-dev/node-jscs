var Checker = require('../../../lib/checker');
var assert = require('assert');
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
            assert(checker.checkString('var x = {};').isEmpty());
        });

        it('should not report for single-line object', function() {
            assert(checker.checkString('var x = {a: 1, bcd: 2};').isEmpty());
        });

        it('should not report if aligned', function() {
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a   : 1,\n' +
                        'bcd : 2\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should not report shorthand properties', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'bcd : 2,\n' +
                        'a,\n' +
                        'efg : 2\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should not report es6-methods. #1013', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('var x = { a() { } };').isEmpty());
        });

        it('should not report es5 getters/setters #1037', function() {
            assert(checker.checkString('var x = { get a() { } };').isEmpty());
            assert(checker.checkString('var x = { set a(val) { } };').isEmpty());
        });

        it('should not report if aligned with computed property names #1404', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey]: "myOtherValue"',
                    '};'
                ].join('\n')).isEmpty()
            );
        });

        it('should report invalid alignment', function() {
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                ).getErrorCount() === 1
            );
        });

        it('should report if not aligned with computed property names #1404', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString([
                    'var myObject = {',
                      '[myKey]   : "myKeyValue",',
                      '[otherKey] : "myOtherValue"',
                    '};'
                ].join('\n')).getErrorCount() === 1
            );
        });

        it('should not report on an import plus aligned computed property names (#1587)', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString([
                    'import React, {PropTypes} from \'react\';\n',
                    'import {ImmutableComponentPure} from \'common/ImmutableComponent.js\'',
                    'let myObject = {',
                      '[myKey]     : "myKeyValue",',
                      '[$main.pod] : "myOtherValue"',
                    '};'
                ].join('\n')).isEmpty()
            );
        });

        it('should not report es7 object spread. Ref #1624', function() {
            checker.configure({ esnext: true });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'bcd : 2,\n' +
                        '...a,\n' +
                        'efg : 2\n' +
                    '};'
                ).isEmpty()
            );
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

        describe('in conjunction with disallowSpaceAfterObjectKeys', function() {
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
                    'a  : 1,\n' +
                    'foo: function() {},\n' +
                    'bcd: 2\n' +
                '};'
            });
        });
    });

    describe('ignoreFunction option', function() {
        it('should not report function with skipWithFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithFunction' });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should not report function with ignoreFunction', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreFunction' });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        'foo : function() {},\n' +
                        'bcd : 2\n' +
                    '};'
                ).isEmpty()
            );
        });
    });

    describe('ignoreLineBreak option', function() {
        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'skipWithLineBreak' });
            assert(
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
                ).getErrorCount() === 1
            );
        });

        it('should not report with line break between properties', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            assert(
                checker.checkString(
                    'var x = {\n' +
                        'a : 1,\n' +
                        '\n' +
                        'bcd : 2\n' +
                    '};'
                ).isEmpty()
            );
        });

        it('should report invalid alignment in nested object', function() {
            checker.configure({ requireAlignedObjectValues: 'ignoreLineBreak' });
            assert(
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
                ).getErrorCount() === 1
            );
        });
    });
});
