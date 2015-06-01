var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-template-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ esnext: true, requireTemplateStrings: true });
    });

    it('should report the use of string concatenation with a identifier on the left', function() {
        assert(checker.checkString('a + "a"').getErrorCount() === 1);
    });

    it('should report the use of string concatenation with a identifier on the right', function() {
        assert(checker.checkString('"a" + a').getErrorCount() === 1);
    });

    it('should report the use of string concatenation with right handed binary expression',
        function() {
            assert(checker.checkString('"test" + (a + b)').getErrorCount() === 1);
        }
    );

    it('should report the use of string concatenation with left handed binary expression',
        function() {
            assert(checker.checkString('(a + b) + "test"').getErrorCount() === 1);
        }
    );

    it('should report for the use of string concatenation with a CallExpression',
        function() {
            assert(checker.checkString('a() + "a"').getErrorCount() === 1);
            assert(checker.checkString('"a" + a()').getErrorCount() === 1);
        }
    );

    it('should report for the use of string concatenation with a MemberExpression',
        function() {
            assert(checker.checkString('a.b + "a"').getErrorCount() === 1);
            assert(checker.checkString('"a" + a.b').getErrorCount() === 1);
        }
    );

    it('should report for the use of string concatenation with a TemplateLiteral',
        function() {
            assert(checker.checkString('`a` + "a"').getErrorCount() === 1);
            assert(checker.checkString('"a" + `a`').getErrorCount() === 1);
        }
    );

    it('should report for the use of string concatenation with a TaggedTemplateExpression',
        function() {
            assert(checker.checkString('a`a` + "a"').getErrorCount() === 1);
            assert(checker.checkString('"a" + a`a`').getErrorCount() === 1);
        }
    );

    it('should report the use of string concatenation with two string literals', function() {
        assert(checker.checkString('"a" + "a"').getErrorCount() === 1);
    });

    it('should not report the use of string concatenation with a identifier on the left and right', function() {
        assert(checker.checkString('a + a').isEmpty());
    });

    it('should not report the use of template strings', function() {
        assert(checker.checkString('`How are you, ${name}?`').isEmpty());
    });

    it('should not report for number literals', function() {
        assert(checker.checkString('1 + a').isEmpty());
        assert(checker.checkString('a + 1').isEmpty());
    });

    it('should not report for null literal', function() {
        assert(checker.checkString('null + a').isEmpty());
        assert(checker.checkString('a + null').isEmpty());
    });

    it('should not report for true literal', function() {
        assert(checker.checkString('true + a').isEmpty());
        assert(checker.checkString('a + false').isEmpty());
    });

    it('should not report for binary expression that isn\'t +', function() {
        assert(checker.checkString('1 * 2').isEmpty());
        assert(checker.checkString('a === b').isEmpty());
    });
});
