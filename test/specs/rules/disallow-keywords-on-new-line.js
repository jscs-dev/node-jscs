var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-keywords-on-new-line', function() {
    var checker;
    var input;
    var output;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('illegal comma illegal keyword placement for catch', function() {
        beforeEach(function() {
            checker.configure({ disallowKeywordsOnNewLine: ['catch'] });

            input = 'try {\n' +
                    'x++;\n' +
                '}\n' +
                'catch(e) {\n' +
                    'x--;\n' +
                '}';

            output = 'try {\n' +
                    'x++;\n' +
                '} catch(e) {\n' +
                    'x--;\n' +
                '}';
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

    describe('illegal keyword placement', function() {
        beforeEach(function() {
            checker.configure({ disallowKeywordsOnNewLine: ['else'] });

            input = 'if (x) {\n' +
                    'x++;\n' +
                '}\n' +
                'else {\n' +
                    'x--;\n' +
                '}';

            output = 'if (x) {\n' +
                    'x++;\n' +
                '} else {\n' +
                    'x--;\n' +
                '}';
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
