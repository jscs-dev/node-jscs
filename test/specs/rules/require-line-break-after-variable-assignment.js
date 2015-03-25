var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-line-break-after-variable-assignment', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('"line-break-after-variable-assignment"', function() {
        beforeEach(function() {
            checker.configure({ requireLineBreakAfterVariableAssignment: true });
        });

        it('should report when variables are defined and assigned on the same line.', function() {
            assert(checker.checkString('var x = 1, y = 2;').getErrorCount() === 1);
        });

        it('should not report when variables are defined but not assigned.', function() {
            assert(checker.checkString('var x, y, z;').isEmpty());
        });

        it('should not report when variables are defined and assigned on different lines.', function() {
            assert(checker.checkString('var x = 1,\ny = 2;').isEmpty());
        });

        it('should not report on single line variable declarations.', function() {
            assert(checker.checkString('var x = 1;').isEmpty());
        });

        it('should report when unassigned variables on same line as assigned variables.', function() {
            assert(checker.checkString('var x, y, z, y = 5, z;').getErrorCount() === 1);
        });

        it('should report when unitialised variables follow a declaration.', function() {
            assert(checker.checkString('var a, b,\n\tc=1, d;').getErrorCount() === 1);
        });

        it('should report when multiple var statements on single line.', function() {
            assert(checker.checkString('var bad = {\n\tkey : value\n}; var heckWhyNot = 5;').getErrorCount() === 1);
        });

        it('should not report when variables are defined in the init part of a for loop', function() {
            assert(checker.checkString('for (var i = 0, length = myArray.length; i < length; i++) {}').isEmpty());
        });

        it('should not report when variables are defined in the init part of a for in loop', function() {
            assert(checker.checkString('for (var i in arr) {}').isEmpty());
        });

        it('should not report when variables are defined in the init part of a for of loop', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('for (var i of arr) {}').isEmpty());
        });

        it('should report for variables defined in the body of a for loop', function() {
            assert(checker.checkString(
                'for (var i = 0, length = myArray.length; i < length; i++) {' +
                    'var x = 1, y = 2;' +
                '}'
            ).getErrorCount() === 1);
        });

        it('should report for let when defined and assigned on the same line.', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('let x = 1, y = 2;').getErrorCount() === 1);
        });

        it('should report for const when defined and assigned on the same line.', function() {
            checker.configure({ esnext: true });
            assert(checker.checkString('const x = 1, y = 2;').getErrorCount() === 1);
        });
    });
});
