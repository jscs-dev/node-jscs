var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-yoda-conditions', function() {
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

            describe(value + ' option', function() {
                beforeEach(function() {
                    checker.configure({ requireYodaConditions: value });
                });

                it('should not report yoda condition for yodaCondition', function() {
                    expect(checker.checkString(yodaCondition)).to.have.no.errors();
                });

                it('should report normal condition', function() {
                    expect(checker.checkString(notYodaCondition))
                      .to.have.one.validation.error.from('requireYodaConditions');
                });
            });
        });
    });

    describe('option true', function() {
        beforeEach(function() {
            checker.configure({ requireYodaConditions: true });
        });

        it('should report normal condition for numeric', function() {
            expect(checker.checkString(
                    'if (x == 1) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('requireYodaConditions');
        });

        it('should report normal condition for boolean', function() {
            expect(checker.checkString(
                    'if (x == true) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('requireYodaConditions');
        });

        it('should report normal condition for string', function() {
            expect(checker.checkString(
                    'if (x == \'\') {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('requireYodaConditions');
        });

        it('should report normal condition for null', function() {
            expect(checker.checkString(
                    'if (x == null) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('requireYodaConditions');
        });

        it('should report normal condition for undefined', function() {
            expect(checker.checkString(
                    'if (x == undefined) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('requireYodaConditions');
        });

        it('should not report yoda condition', function() {
            expect(checker.checkString(
                    'if (1 == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });

        it('should not report right hand side expressions', function() {
            expect(checker.checkString(
                    'if (1 == (x % 2)) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });

        it('should not report non-comparison binary expressions', function() {
            expect(checker.checkString(
                    'if (x % 2) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });
    });
});
