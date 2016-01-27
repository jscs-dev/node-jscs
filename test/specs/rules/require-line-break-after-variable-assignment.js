var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

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
            expect(checker.checkString('var x = 1, y = 2;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should not report when variables are defined but not assigned.', function() {
            expect(checker.checkString('var x, y, z;')).to.have.no.errors();
        });

        it('should not report when variables are defined and assigned on different lines.', function() {
            expect(checker.checkString('var x = 1,\ny = 2;')).to.have.no.errors();
        });

        it('should not report on single line variable declarations.', function() {
            expect(checker.checkString('var x = 1;')).to.have.no.errors();
        });

        it('should report when unassigned variables on same line as assigned variables.', function() {
            expect(checker.checkString('var x, y, z, y = 5, z;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should report when unitialised variables follow a declaration.', function() {
            expect(checker.checkString('var a, b,\n\tc=1, d;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should report when multiple var statements on single line.', function() {
            expect(checker.checkString('var bad = {\n\tkey : value\n}; var heckWhyNot = 5;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should not report when variables are defined in the init part of a for loop', function() {
            expect(checker.checkString('for (var i = 0, length = myArray.length; i < length; i++) {}'))
              .to.have.no.errors();
        });

        it('should not report when variables are defined in the init part of a for in loop', function() {
            expect(checker.checkString('for (var i in arr) {}')).to.have.no.errors();
        });

        it('should not report when variables are defined in the init part of a for of loop', function() {
            expect(checker.checkString('for (var i of arr) {}')).to.have.no.errors();
        });

        it('should report for variables defined in the body of a for loop', function() {
            expect(checker.checkString(
                'for (var i = 0, length = myArray.length; i < length; i++) {' +
                    'var x = 1, y = 2;' +
                '}'
            )).to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should report for let when defined and assigned on the same line.', function() {
            expect(checker.checkString('let x = 1, y = 2;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });

        it('should report for const when defined and assigned on the same line.', function() {
            expect(checker.checkString('const x = 1, y = 2;'))
              .to.have.one.validation.error.from('requireLineBreakAfterVariableAssignment');
        });
    });
});
