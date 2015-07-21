var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-keywords-on-new-line', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    reportAndFix({
        name: 'illegal comma illegal keyword placement for catch',
        rules: { disallowKeywordsOnNewLine: ['catch'] },
        input: 'try {\n' +
                    'x++;\n' +
                '}\n' +
                'catch(e) {\n' +
                    'x--;\n' +
                '}',
        output: 'try {\n' +
                    'x++;\n' +
                '} catch(e) {\n' +
                    'x--;\n' +
                '}'
    });

    reportAndFix({
        name: 'illegal comma illegal keyword placement for catch',
        rules: { disallowKeywordsOnNewLine: ['else'] },
        input: 'if (x) {\n' +
                    'x++;\n' +
                '}\n' +
                'else {\n' +
                    'x--;\n' +
                '}',
        output: 'if (x) {\n' +
                    'x++;\n' +
                '} else {\n' +
                    'x--;\n' +
                '}'
    });

    describe('illegal keyword placement for "do while" (#885)', function() {
        var input;
        var output;

        beforeEach(function() {
            checker.configure({ disallowKeywordsOnNewLine: ['while'] });

            input = 'do {\n' +
                    'x++;\n' +
                '}\n' +
                'while(x > 0)';

            output = 'do {\n' +
                    'x++;\n' +
                '} while(x > 0)';
        });

        it('should report', function() {
            assert(checker.checkString(input).getErrorCount() === 1);
        });

        it('should fix', function() {
            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, output);
        });
    });

    it('should not report legal keyword placement', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['else'] });
        assert(
            checker.checkString(
                'if (x) {\n' +
                    'x++;\n' +
                '} else {\n' +
                    'x--;\n' +
                '}'
            ).isEmpty()
        );
    });

    it('should not report special case for "else" statement without braces (#905)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['else'] });
        assert(
            checker.checkString(
                'if (block) block[v]["(type)"] = "var";\n' +
                'else funct[v] = "var";'
            ).isEmpty()
        );
    });

    it('should not report legal keyword placement for "do while" (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'do {\n' +
                    'x++;\n' +
                '}while(x > 0)'
            ).isEmpty()
        );
    });

    it('should not report special case for "do while" multiple line statement without braces (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'do\n' +
                    ';\n' +
                'while(i > 0)'
            ).isEmpty()
        );
    });

    it('should not report legal keyword placement for "while" statement (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'var i = 0;\n' +
                'if (i) {\n' +
                    'i++;\n' +
                '}' +
                'while(i > 0) {\n' +
                    ';\n' +
                '}'
            ).isEmpty()
        );
    });

    describe('legal block comments before key word (#1421)', function() {
        it('should not report legal keyword placement for a "if else"',
            function() {
            checker.configure({ disallowKeywordsOnNewLine: ['else'] });
            assert(
                checker.checkString(
                    'if (x) {\n' +
                        'x++;\n' +
                    '}\n' +
                    '/* comments */\n' +
                    'else {\n' +
                        'x--;\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report legal keyword for a "do while"', function() {
            checker.configure({ disallowKeywordsOnNewLine: ['while'] });
            assert(
                checker.checkString(
                    'do {\n' +
                        'x++;\n' +
                    '}\n' +
                    '/* comments */\n' +
                    'while(x > 0)'
                ).isEmpty()
            );
        });
    });

    describe('legal line comments before key word (#1421)', function() {
        it('should not report legal keyword placement for a "if else"',
            function() {
            checker.configure({ disallowKeywordsOnNewLine: ['else'] });
            assert(
                checker.checkString(
                    'if (x) {\n' +
                        'x++;\n' +
                    '}\n' +
                    '// comments\n' +
                    'else {\n' +
                        'x--;\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report legal keyword for a "do while"', function() {
            checker.configure({ disallowKeywordsOnNewLine: ['while'] });
            assert(
                checker.checkString(
                    'do {\n' +
                        'x++;\n' +
                    '}\n' +
                    '// comments\n' +
                    'while(x > 0)'
                ).isEmpty()
            );
        });
    });

    describe('fix', function() {
        it('should not fix special case for "else" statement without braces (#905)', function() {
            checker.configure({ disallowKeywordsOnNewLine: ['else'] });

            var input = 'if (block) block[v]["(type)"] = "var";\n' +
                'else funct[v] = "var";';

            var result = checker.fixString(input);
            assert(result.errors.isEmpty());
            assert.equal(result.output, input);
        });
    });
});
