var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-keywords-on-new-line', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
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
});
