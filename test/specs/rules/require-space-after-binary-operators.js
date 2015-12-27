var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').binaryOperators;

describe('rules/require-space-after-binary-operators', function() {
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

            it('should report sticky operator for ' + sticked + ' with true option',
                function() {
                    checker.configure({ requireSpaceAfterBinaryOperators: true });
                    expect(checker.checkString(sticked))
                      .to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
                }
            );

            it('should report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterBinaryOperators: [operator] });
                    expect(checker.checkString(sticked))
                      .to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterBinaryOperators: [operator] });
                    expect(checker.checkString(notSticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterBinaryOperators: [operator] });
                    expect(checker.checkString(stickedWithParenthesis))
                      .to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterBinaryOperators: [operator] });
                    expect(checker.checkString(notStickedWithParenthesis)).to.have.no.errors();
                }
            );
        });
    });

    it('should not report sticky operator for ({ test:2 })', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [':'] });
        expect(checker.checkString('({ test:2 })')).to.have.no.errors();
    });

    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [':'] });
        expect(checker.checkString('test?1:2')).to.have.no.errors();
    });

    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: ['?'] });
        expect(checker.checkString('test?1:2')).to.have.no.errors();
    });

    it('should not report assignment operator for "a=b" without option', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('a=b')).to.have.no.errors();
    });

    it('should report comma operator (as separator) in function argument', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('function test(a,b){}'))
          .to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
    });

    it('should report for assignment expression', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x=1')).to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
    });

    it('should report for assignment expressions', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x=1, t=2')).to.have.error.count.equal(2);
    });

    it('should not report for assignment expressions without "=" sign', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x,z;')).to.have.no.errors();
    });

    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('var x=1;')).to.have.no.errors();
    });

    it('should report correct error message (#907)', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: ['='] });

        var errors = checker.checkString('var x =1;');
        var error = errors.getErrorList()[0];

        expect(errors).to.have.one.validation.error.from('requireSpaceAfterBinaryOperators');
        expect(errors.explainError(error))
          .to.have.string('Operator = should not stick to following expression at input');
    });

    it('should not report error for sparse arrays', function() {
        checker.configure({ requireSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('var x = [1, , , 2], y = 32')).to.have.no.errors();
    });

});
