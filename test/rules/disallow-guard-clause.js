var Checker = require('../../lib/checker');
var assert = require('assert');

describe('/rules/disallow-guard-clause', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowGuardClause: true
        });
    });

    it('should report guard clause which use `return` statement', function() {
        assert(
            checker.checkString(
                'function test() { if (x) return; }'
            ).getErrorCount() === 1
        );
    });

    it('should report guard clause which use `break` statement', function() {
        assert(
            checker.checkString(
                'while (true) {\n' +
                    'if (true) break;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report guard clause which use `continue` statement', function() {
        assert(
            checker.checkString(
                'while (true) {\n' +
                    'if (true) continue;\n' +
                '}'
            ).getErrorCount() === 1
        );
    });

    it('should report guard clause which use curly braces', function() {
        assert(
            checker.checkString(
                 'function test() { if (x) { return; } }'
            ).getErrorCount() === 1
        );
    });

    it('should not report normal `if` statement', function() {
        assert(
            checker.checkString(
                 'if (true) {\n' +
                    'console.log("Hello world!");\n' +
                 '}'
            ).isEmpty()
        );
    });
});
