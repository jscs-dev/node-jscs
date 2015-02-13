var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-keywords-on-new-line', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report illegal keyword placement for catch', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['catch'] });
        assert(
            checker.checkString(
                'try {\n' +
                    'x++;\n' +
                '}\n' +
                'catch(e) {\n' +
                    'x--;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report illegal keyword placement for do while', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'do {\n' +
                    'x++;\n' +
                '}\n' +
                'while(x > 0)'
            ).getErrorCount() === 1
        );
    });

    it('should report illegal keyword placement', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['else'] });
        assert(
            checker.checkString(
                'if (x) {\n' +
                    'x++;\n' +
                '}\n' +
                'else {\n' +
                    'x--;\n' +
                '}'
            ).getErrorCount() === 1
        );
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

    it('should not report special case for "while" statement without is not part of do (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'var i = 0\n' +
                'while(i > 0) {\n' +
                    ';\n' +
                '}'
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

    it('should not report special case for "do while" single line statement without braces (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'do ; while(i > 0)'
            ).isEmpty()
        );
    });

    it('should not report special case for "do while" enclosing an inner while loop (#885)', function() {
        checker.configure({ disallowKeywordsOnNewLine: ['while'] });
        assert(
            checker.checkString(
                'do {\n' +
                    'while(i > 0) {\n' +
                        ';\n' +
                    '}' +
                    'x++;\n' +
                '} while(x > 0)'
            ).isEmpty()
        );
    });
});
