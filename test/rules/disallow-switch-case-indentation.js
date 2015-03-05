var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-switch-case-indentation', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSwitchCaseIndentation: true });
    });

    it('should report if the `case` indentation does not match `switch`', function() {
        assert(checker.checkString('switch (x) {\n case "1": break;\n}').getErrorCount() === 1);
        assert(checker.checkString('switch (x) {\n case "1": break; case "2": break;\n}').getErrorCount() === 2);
    });

    it('should report for a nested switch with incorrect indentation', function() {
        assert(checker.checkString(
            'switch (x) {\ncase "1":\n switch (y) {\ncase "1": break;\n }\nbreak;\n}'
        ).isEmpty());
    });

    it('should not report if the `case` indentation matches `switch`', function() {
        assert(checker.checkString('switch (x) {\ncase "1": break;\n}').isEmpty());
        assert(checker.checkString('switch (x) {\ncase "1": break;\ncase "2": break;\n}').isEmpty());
    });

    it('should not report if the `case` is on the same line as `switch`', function() {
        assert(checker.checkString('switch (x) { case "1": break; }').isEmpty());
        assert(checker.checkString('switch (x) {case "1": break; case "2": break;}').isEmpty());
    });

    it('should not report for multiple switches at different indentation levels', function() {
        assert(checker.checkString(
            'switch (x) {\ncase "1": break;\n}\n switch (y) {\n case "1": break;\n }'
        ).isEmpty());
    });

    it('should not report for a nested switch with correct indentation', function() {
        assert(checker.checkString(
            'switch (x) {\ncase "1":\n switch (y) {\n case "1": break;\n }\nbreak;\n}'
        ).isEmpty());
    });
});
