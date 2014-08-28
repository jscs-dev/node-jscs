var Checker = require('../../lib/checker');
var assert = require('assert');

describe('/rules/validate-guard-clause', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should report missing guard clause braces', function() {
        checker.configure({ validateGuardClause: { requireCurlyBraces: true } });
        assert(
            checker.checkString(
                'function test() { if (x) return; }'
            ).getErrorCount() === 1
        );
    });

    it('should not report guard clause with braces', function() {
        checker.configure({ validateGuardClause: { requireCurlyBraces: true } });
        assert(
            checker.checkString(
                'function test() { if (x) { return; } }'
            ).isEmpty()
        );
    });

    it('should report guard clause with braces', function() {
        checker.configure({ validateGuardClause: { disallowCurlyBraces: true } });
        assert(
            checker.checkString(
                'function test() { if (x) { return; } }'
            ).getErrorCount() === 1
        );
    });

    it('should not report guard clause without braces', function() {
        checker.configure({ validateGuardClause: { disallowCurlyBraces: true } });
        assert(
            checker.checkString(
                'function test() { if (x) return; }'
            ).isEmpty()
        );
    });

    it('should report guard clause which is not written in one line', function() {
        checker.configure({ validateGuardClause: { requireInOneLine: true } });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x)\n' +
                        'return;' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should not report guard clause which is written in one line', function() {
        checker.configure({ validateGuardClause: { requireInOneLine: true } });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x) return;' +
                '}'
            ).isEmpty()
        );
    });

    it('should report guard clause which is in one line', function() {
        checker.configure({ validateGuardClause: { disallowInOneLine: true } });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x) return;' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should not report guard clause which is not in one line', function() {
        checker.configure({ validateGuardClause: { disallowInOneLine: true } });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x)\n' +
                        'return;' +
                '}'
            ).isEmpty()
        );
    });

    it('should not validate and even report normal `if` statement', function() {
        checker.configure({
            validateGuardClause: {
                disallowCurlyBraces: true,
                disallowInOneLine: true
            }
        });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x) { x++; }' +
                '}'
            ).isEmpty()
        );
    });

    it('should not validate and even report normal `if` statement', function() {
        checker.configure({
            validateGuardClause: {
                requireCurlyBraces: true,
                requireInOneLine: true
            }
        });
        assert(
            checker.checkString(
                'function test() {\n' +
                    'if (x)\n' +
                        'x++;' +
                '}'
            ).isEmpty()
        );
    });
});
