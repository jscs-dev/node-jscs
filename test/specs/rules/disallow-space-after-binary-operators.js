var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').binaryOperators;

describe('rules/disallow-space-after-binary-operators', function() {
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
            it('should not report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterBinaryOperators: value });
                    expect(checker.checkString(sticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterBinaryOperators: value });
                    expect(checker.checkString(notSticked))
                      .to.have.one.validation.error.from('disallowSpaceAfterBinaryOperators');
                }
            );

            it('should not report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterBinaryOperators: value });
                    expect(checker.checkString(stickedWithParenthesis)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterBinaryOperators: value });
                    expect(checker.checkString(notStickedWithParenthesis))
                      .to.have.one.validation.error.from('disallowSpaceAfterBinaryOperators');
                }
            );
        });
    });

    it('should not report sticky operator for ({ test : 2 })', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [':'] });
        expect(checker.checkString('({ test : 2 })')).to.have.no.errors();
    });

    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [':'] });
        expect(checker.checkString('test ? 1 : 2')).to.have.no.errors();
    });

    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['?'] });
        expect(checker.checkString('test ? 1 : 2')).to.have.no.errors();
    });

    it('should not report assignment operator for "a = b" without option', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('a = b')).to.have.no.errors();
    });

    it('should report comma operator (as separator) in function argument', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('function test(a, b){}'))
          .to.have.one.validation.error.from('disallowSpaceAfterBinaryOperators');
    });

    it('should report for assignment expression', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('x = 1')).to.have.one.validation.error.from('disallowSpaceAfterBinaryOperators');
    });

    it('should report for assignment expressions', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x = 1, t = 2')).to.have.error.count.equal(2);
    });

    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('var x = 1;')).to.have.no.errors();
    });

    it('should not report empty assignment expression', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x')).to.have.no.errors();
    });

    it('should not report empty assignment expression', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['='] });
        expect(checker.checkString('var x')).to.have.no.errors();
    });

    it('should report correct error message (#907)', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['='] });

        var errors = checker.checkString('var x= 1;');
        var error = errors.getErrorList()[0];

        expect(errors).to.have.one.validation.error.from('disallowSpaceAfterBinaryOperators');
        expect(errors.explainError(error)).to.have.string('Operator = should stick to following expression at input');
    });

    it('should not report error for sparse arrays', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [','] });
        expect(checker.checkString('var x = [1, , ,2] ,y = 32')).to.have.no.errors();
    });

});
