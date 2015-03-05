var Checker = require('../../../lib/checker');
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

    describe('fix', function() {
        it ('should fix try catch', function() {
            checker.configure({ disallowKeywordsOnNewLine: ['catch'] });
            var result = checker.fixString(
                'try {\n' +
                    'x++;\n' +
                '}\n' +
                'catch(e) {\n' +
                    'x--;\n' +
                '}'
            );

            assert(result.errors.isEmpty());
            assert.equal(result.output,
                'try {\n' +
                    'x++;\n' +
                '} catch(e) {\n' +
                    'x--;\n' +
                '}'
                );
        });

        it('should not fix special case for "else" statement without braces (#905)', function() {
            checker.configure({ disallowKeywordsOnNewLine: ['else'] });
            var result = checker.fixString(
                'if (block) block[v]["(type)"] = "var";\n' +
                'else funct[v] = "var";'
            );

            assert(result.errors.isEmpty());
            assert.equal(result.output,
                'if (block) block[v]["(type)"] = "var";\n' +
                'else funct[v] = "var";'
            );
        });
    });
});
