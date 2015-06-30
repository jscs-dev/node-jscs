var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/disallow-yoda-conditions', function() {
    var checker;
    var operators = ['==', '===', '!=', '!=='];

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        var yodaCondition = 'var test; 1' + operator + 'test';
        var notYodaCondition = 'var test; test' + operator + '1';

        [[operator], true].forEach(function(value) {

            describe.skip(value + ' option', function() {
                beforeEach(function() {
                    checker.configure({ requireYodaConditions: value });
                });

                it('should not report yoda condition for yodaCondition', function() {
                    expect(checker.checkString(yodaCondition)).to.have.no.errors();
                });

                it('should report normal condition', function() {
                    expect(checker.checkString(notYodaCondition))
            .to.have.one.error.from('ruleName');
                });
            });
        });
    });

    describe.skip('option true', function() {
        beforeEach(function() {
            checker.configure({ requireYodaConditions: true });
        });

        it('should report normal condition for numeric', function() {
            assert(
                checker.checkString(
                    'if (x == 1) {\n' +
                        'x++;\n' +
                    '}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report normal condition for boolean', function() {
            assert(
                checker.checkString(
                    'if (x == true) {\n' +
                        'x++;\n' +
                    '}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report normal condition for string', function() {
            assert(
                checker.checkString(
                    'if (x == \'\') {\n' +
                        'x++;\n' +
                    '}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report normal condition for null', function() {
            assert(
                checker.checkString(
                    'if (x == null) {\n' +
                        'x++;\n' +
                    '}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should report normal condition for undefined', function() {
            assert(
                checker.checkString(
                    'if (x == undefined) {\n' +
                        'x++;\n' +
                    '}'
                ).getValidationErrorCount() === 1
            );
        });

        it('should not report yoda condition', function() {
            assert(
                checker.checkString(
                    'if (1 == x) {\n' +
                        'x++;\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report right hand side expressions', function() {
            assert(
                checker.checkString(
                    'if (1 == (x % 2)) {\n' +
                        'x++;\n' +
                    '}'
                ).isEmpty()
            );
        });

        it('should not report non-comparison binary expressions', function() {
            assert(
                checker.checkString(
                    'if (x % 2) {\n' +
                        'x++;\n' +
                    '}'
                ).isEmpty()
            );
        });
    });
});
