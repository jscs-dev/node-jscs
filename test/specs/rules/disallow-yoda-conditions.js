var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-yoda-conditions', function() {
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
                    checker.configure({ disallowYodaConditions: value });
                });

                it('should report yoda condition for yodaCondition', function() {
                    expect(checker.checkString(yodaCondition))
                      .to.have.one.validation.error.from('disallowYodaConditions');
                });

                it('should not report normal condition', function() {
                    expect(checker.checkString(notYodaCondition)).to.have.no.errors();
                });
            });
        });
    });

    describe('option true', function() {
        beforeEach(function() {
            checker.configure({ disallowYodaConditions: true });
        });

        it('should report yoda condition for numeric', function() {
            expect(checker.checkString(
                    'if (1 == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('disallowYodaConditions');
        });

        it('should report yoda condition for boolean', function() {
            expect(checker.checkString(
                    'if (true == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('disallowYodaConditions');
        });

        it('should report yoda condition for string', function() {
            expect(checker.checkString(
                    'if (\'\' == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('disallowYodaConditions');
        });

        it('should report yoda condition for null', function() {
            expect(checker.checkString(
                    'if (null == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('disallowYodaConditions');
        });

        it('should report yoda condition for undefined', function() {
            expect(checker.checkString(
                    'if (undefined == x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.one.validation.error.from('disallowYodaConditions');
        });

        it('should not report normal condition', function() {
            expect(checker.checkString(
                    'if (x == 1) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });

        it('should not report left hand side expressions', function() {
            expect(checker.checkString(
                    'if ((x % 2) == 1) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });

        it('should not report non-comparison binary expressions', function() {
            expect(checker.checkString(
                    'if (2 % x) {\n' +
                        'x++;\n' +
                    '}'
                )).to.have.no.errors();
        });
    });
});
