var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../assertHelpers').reportAndFix;

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
