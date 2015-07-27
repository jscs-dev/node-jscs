var Checker = require('../../../lib/checker');
var assert = require('assert');
var fs = require('fs');

describe('rules/validate-indentation', function() {
    var checker;

    function readData(filename) {
        return fs.readFileSync(__dirname + '/../../data/' + filename, 'utf8');
    }

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    function checkErrors(string, expectedErrorLines) {
        var errors = checker.checkString(string).getErrorList().sort(function(a, b) {
            return a.line - b.line;
        });

        errors.forEach(function(error, i) {
            assert(error.line === expectedErrorLines[i], 'did not expect an error on line ' + error.line);
        });
        expectedErrorLines.forEach(function(line, i) {
            assert(errors[i] && errors[i].line === line, 'expected an error on line ' + line);
        });
        assert(expectedErrorLines.length === errors.length);
    }

    it('should error if a negative indentation is provided', function() {
        assert.throws(function() {
            checker.configure({ validateIndentation: -2 });
        });
    });

    it('should error if a nonsense string is provided', function() {
        assert.throws(function() {
            checker.configure({ validateIndentation: 'wrong' });
        });
    });

    it('should report no errors on a single line program', function() {
        checker.configure({ validateIndentation: '\t' });
        assert(checker.checkString('switch(true){case b:break;}').isEmpty());
    });

    it('should validate tab indentation properly', function() {
        checker.configure({ validateIndentation: '\t' });
        checkErrors('if (a){\n\tb=c;\n\t\tc=d;\ne=f;\n}', [3, 4]);
    });

    it('should validate 4 spaces indentation properly', function() {
        checker.configure({ validateIndentation: 4 });
        checkErrors('if (a){\n    b=c;\n      c=d;\n e=f;\n}', [3, 4]);
    });

    it('should validate 2 spaces indentation properly', function() {
        var fixture = readData('validate-indentation/check.js');
        checker.configure({ validateIndentation: 2, maxErrors: Infinity });
        checkErrors(fixture, [
            5,
            6,
            10,
            11,
            15,
            16,
            23,
            29,
            30,
            36,
            38,
            39,
            40,
            46,
            54,
            114,
            120,
            124,
            127,
            134,
            139,
            145,
            149,
            152,
            159,
            168,
            176,
            184,
            186,
            200,
            202,
            214,
            218,
            220,
            330,
            331,
            371,
            372,
            375,
            376,
            379,
            380,
            386,
            388,
            399,
            401,
            405,
            407,
            414,
            416,
            421,
            423,
            440,
            441,
            447,
            448,
            454,
            455,
            461,
            462,
            467,
            472,
            486,
            488,
            534,
            541,
            569,
            575,
            596,
            599,
            607,
            611,
            619,
            623,
            625,
            626,
            630,
            634,
            644,
            659,
            660,
            663,
            673,
            683,
            685,
            686
        ]);
    });

    describe('includeEmptyLines', function() {
        it('should validate indentation on an empty line when includeEmptyLines is true', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t',
                    includeEmptyLines: true
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n\n}').getErrorCount() === 1);
            assert(checker.checkString('if (a){\n\t\n}').isEmpty());
        });

        it('should not validate indentation on an empty line when includeEmptyLines is false', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t',
                    includeEmptyLines: false
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n\n}').isEmpty());
        });
    });

    describe('allExcept["emptyLines"] option', function() {
        it('should validate indentation on an empty line when includeEmptyLines is true', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t',
                    allExcept: ['emptyLines']
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n\n}').getErrorCount() === 1);
            assert(checker.checkString('if (a){\n\t\n}').isEmpty());
        });

        it('should not validate indentation on an empty line when includeEmptyLines is false', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t',
                    includeEmptyLines: false
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n\n}').isEmpty());
        });
    });

    describe('allExcept["comments"] option', function() {
        it('should not validate indentation in comments when allExcept = ["comments"]', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t',
                    allExcept: ['comments']
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n//\tComment\n}').isEmpty());
        });
        it('should validate indentation in comments when allExcept = ["comments"] is not defined', function() {
            checker.configure({
                validateIndentation: {
                    value: '\t'
                }
            });

            assert(checker.checkString('if (a){\n\tb=c;\n//\tComment\n}').getErrorCount() === 1);
        });
    });

    describe('module pattern indentation', function() {
        beforeEach(function() {
            checker.configure({ validateIndentation: 4 });
        });

        var cases = {
            'no indentation': 'a++;',
            indentation: '    a++;',
            'empty body': ''
        };

        Object.keys(cases).forEach(function(title) {
            var statement = cases[title];

            it('should allow ' + title + ' in UMD Shim', function() {
                var source = '\n' +
                '(function( factory ) {\n' +
                '    if ( typeof define === "function" && define.amd ) {\n' +
                '        define(factory);\n' +
                '    } else {\n' +
                '        factory();\n' +
                '    }\n' +
                '}(function( $ ) {\n' +
                statement + '\n' +
                '}));';
                assert(checker.checkString(source).isEmpty());
            });

            it('should allow ' + title + ' in define', function() {
                var source = '\n' +
                'define(["dep"], function( dep ) {\n' +
                statement + '\n' +
                '});';
                assert(checker.checkString(source).isEmpty());
            });

            it('should allow ' + title + ' in require', function() {
                var source = '\n' +
                'require(["dep"], function( dep ) {\n' +
                statement + '\n' +
                '});';
                assert(checker.checkString(source).isEmpty());
            });

            it('should allow ' + title + ' in full file IIFE', function() {
                var source = '\n' +
                '(function(global) {\n' +
                statement + '\n' +
                '}(this));';
                assert(checker.checkString(source).isEmpty());
            });
        });

        it('should not allow no indentation in some other top level function', function() {
            var source = '\n' +
            'defines(["dep"], function( dep ) {\n' +
            'a++;\n' +
            '});';
            assert(!checker.checkString(source).isEmpty());
        });
    });

    describe('fixing', function() {
        it('should fix files with 2 spaces', function() {
            checker.configure({ validateIndentation: 2 });
            var fixtureInput = readData('validate-indentation/fix-input.js');
            var fixtureExpected = readData('validate-indentation/fix-expected.js');
            assert.equal(checker.fixString(fixtureInput).output, fixtureExpected);
        });

        it('should fix files with 2 spaces and includeEmptyLines', function() {
            checker.configure({ validateIndentation: { value: 2, includeEmptyLines: true } });
            var fixtureInput = readData('validate-indentation/fix-include-empty-input.js');
            var fixtureExpected = readData('validate-indentation/fix-include-empty-expected.js');
            assert.equal(checker.fixString(fixtureInput).output, fixtureExpected);
        });
    });

    describe('switch identation', function() {
        beforeEach(function() {
            checker.configure({ validateIndentation: 4 });
        });

        it('should not report errors for indent when return statement is used instead of break', function() {
            assert(
                checker.checkString(
                    'function foo() {\n' +
                    '    var a = "a";\n' +
                    '    switch(a) {\n' +
                    '        case "a":\n' +
                    '            return "A";\n' +
                    '        case "b":\n' +
                    '            return "B";\n' +
                    '    }\n' +
                    '}\n' +
                    'foo();'
                ).isEmpty()
            );
        });

        it('should not report errors for mixed indent between return and break', function() {
            assert(
                checker.checkString(
                    'function foo() {\n' +
                    '    var a = "a";\n' +
                    '    switch(a) {\n' +
                    '        case "a":\n' +
                    '            return "A";\n' +
                    '        case "b":\n' +
                    '        break;\n' +
                    '        case "c":\n' +
                    '            a++;\n' +
                    '        break;\n' +
                    '    }\n' +
                    '}\n' +
                    'foo();'
                ).isEmpty()
            );
        });

        it('should not report errors for switches without semicolons', function() {
            assert(
                checker.checkString(' ' +
                'function a (x) {\n' +
                '    switch (x) {\n' +
                '        case 1:\n' +
                '            return 1\n' +
                '        default:\n' +
                '            return 2\n' +
                '    }\n' +
                '}'
                ).isEmpty()
            );
        });

        it('should report errors for indent after no indent in same switch statement', function() {
            assert(
                checker.checkString(
                    'switch(value){\n' +
                        '    case "1":\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '    case "2":\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '    default:\n' +
                        '        a();\n' +
                        '        break;\n' +
                        '}'
                ).getErrorCount() === 1
            );
        });

        it('should report errors for no indent after indent in same switch statement', function() {
            assert(
                checker.checkString(
                    'switch(value){\n' +
                        '    case "1":\n' +
                        '        a();\n' +
                        '        break;\n' +
                        '    case "2":\n' +
                        '        a();\n' +
                        '        break;\n' +
                        '    default:\n' +
                        '    break;\n' +
                        '}'
                ).getErrorCount() === 1
            );
        });

        it('should report errors for no indent after indent in different switch statements', function() {
            assert(
                checker.checkString(
                    'switch(value){\n' +
                        '    case "1":\n' +
                        '    case "2":\n' +
                        '        a();\n' +
                        '        break;\n' +
                        '    default:\n' +
                        '        break;\n' +
                        '}\n' +
                        'switch(value){\n' +
                        '    case "1":\n' +
                        '    break;\n' +
                        '    case "2":\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '    default:\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '}'
                ).getErrorCount() === 3
            );
        });

        it('should report errors for indent after no indent in different switch statements', function() {
            assert(
                checker.checkString(
                    'switch(value){\n' +
                        '    case "1":\n' +
                        '    case "2":\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '    default:\n' +
                        '        a();\n' +
                        '    break;\n' +
                        '}\n' +
                        'switch(value){\n' +
                        '    case "1":\n' +
                        '        a();\n' +
                        '        break;\n' +
                        '    case "2":\n' +
                        '        break;\n' +
                        '    default:\n' +
                        '        break;\n' +
                        '}'
                ).getErrorCount() === 3
            );
        });
    });
});
