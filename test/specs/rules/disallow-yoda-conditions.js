var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-yoda-conditions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowYodaConditions: true });
    });

    it('should report yoda condition for strict equality', function() {
        assert(
            checker.checkString(
                'if (1 === x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for unequality', function() {
        assert(
            checker.checkString(
                'if (1 != x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for strict unequality', function() {
        assert(
            checker.checkString(
                'if (1 !== x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for gt', function() {
        assert(
            checker.checkString(
                'if (1 > x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for gte', function() {
        assert(
            checker.checkString(
                'if (1 >= x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for lt', function() {
        assert(
            checker.checkString(
                'if (1 < x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for lte', function() {
        assert(
            checker.checkString(
                'if (1 <= x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for numeric', function() {
        assert(
            checker.checkString(
                'if (1 == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for boolean', function() {
        assert(
            checker.checkString(
                'if (true == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for string', function() {
        assert(
            checker.checkString(
                'if (\'\' == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for null', function() {
        assert(
            checker.checkString(
                'if (null == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report yoda condition for undefined', function() {
        assert(
            checker.checkString(
                'if (undefined == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should not report normal condition', function() {
        assert(
            checker.checkString(
                'if (x == 1) {\n' +
                    'x++;\n' +
                '}'
            ).isEmpty()
        );
    });

    it('should not report left hand side expressions', function() {
        assert(
            checker.checkString(
                'if ((x % 2) == 1) {\n' +
                    'x++;\n' +
                '}'
            ).isEmpty()
        );
    });

    it('should not report non-comparison binary expressions', function() {
        assert(
            checker.checkString(
                'if (2 % x) {\n' +
                    'x++;\n' +
                '}'
            ).isEmpty()
        );
    });
});
