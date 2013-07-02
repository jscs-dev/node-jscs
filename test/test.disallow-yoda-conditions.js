var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-yoda-conditions', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report yoda condition for strict equality', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 === x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for unequality', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 != x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for strict unequality', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 !== x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for gt', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 > x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for gte', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 >= x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for lt', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 < x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for lte', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 <= x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for numeric', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (1 == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for boolean', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (true == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for string', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (\'\' == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for null', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (null == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should report yoda condition for undefined', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (undefined == x) {\n' +
                    'x++;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });
    it('should not report normal condition', function() {
        checker.configure({ disallowYodaConditions: true });
        assert(
            checker.checkString(
                'if (x == 1) {\n' +
                    'x++;\n' +
                '}'
            ).isEmpty()
        );
    });
});
