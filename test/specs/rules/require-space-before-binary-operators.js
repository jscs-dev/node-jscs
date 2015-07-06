var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').binaryOperators.filter(function(operator) {
    return operator !== ',';
});

describe.skip('rules/require-space-before-binary-operators', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        var sticked = 'var test; test' + operator + '2';
        var stickedWithParenthesis = 'var test; (test)' + operator + '(2)';

        var notSticked = 'var test; test ' + operator + ' 2';
        var notStickedWithParenthesis = 'var test; (test) ' + operator + ' (2)';

        [[operator], true].forEach(function(value) {

            it('should report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    expect(checker.checkString(sticked))
            .to.have.one.error.from('ruleName');
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    expect(checker.checkString(notSticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    expect(checker.checkString(stickedWithParenthesis))
            .to.have.one.error.from('ruleName');
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    expect(checker.checkString(notStickedWithParenthesis)).to.have.no.errors();
                }
            );

            it('should highlight the end of the ' + operator + ' operator', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                var error = checker.checkString(sticked).getErrorList()[0];
                assert(error.line === 1);
                assert(error.column === 14);
                assert(error.message === ('Operator ' + operator + ' should not stick to preceding expression'));
            });
        });
    });

    it('should not report sticky operator for ({ test:2 })', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [':'] });
        expect(checker.checkString('({ test:2 })')).to.have.no.errors();
    });

    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [':'] });
        expect(checker.checkString('test?1:2')).to.have.no.errors();
    });

    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['?'] });
        expect(checker.checkString('test?1:2')).to.have.no.errors();
    });

    it('should not report assignment operator for "a=b" without option', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        expect(checker.checkString('a=b')).to.have.no.errors();
    });

    it('should report comma operator (as separator) in function argument', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        expect(checker.checkString('function test(a,b){}'))
            .to.have.one.error.from('ruleName');
    });

    it('should report for assignment expression', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        expect(checker.checkString('var x=1'))
            .to.have.one.error.from('ruleName');
    });

    it('should report for assignment expressions', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x=1, t=2').getValidationErrorCount() === 2);
    });

    it('should not report for assignment expressions without "=" sign', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        expect(checker.checkString('var x,z;')).to.have.no.errors();
    });

    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        expect(checker.checkString('var x=1;')).to.have.no.errors();
    });

    it('should not report for comma with "true" value', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: true });
        expect(checker.checkString('1,2;')).to.have.no.errors();
    });
});
