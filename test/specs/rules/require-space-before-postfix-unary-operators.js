var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').incrementAndDecrementOperators;

describe('rules/require-space-before-postfix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        var sticked = 'var test; test' + operator;
        var stickedWithParenthesis = 'var test; (test)' + operator;

        var notSticked = 'var test; test ' + operator;
        var notStickedWithParenthesis = 'var test; (test) ' + operator;

        [[operator], true].forEach(function(value) {
            it('should report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(sticked))
                      .to.have.one.validation.error.from('requireSpaceBeforePostfixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(notSticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(stickedWithParenthesis))
                      .to.have.one.validation.error.from('requireSpaceBeforePostfixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(notStickedWithParenthesis)).to.have.no.errors();
                }
            );
        });
    });

    it('should report sticky operator', function() {
        checker.configure({ requireSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; x++; x--;')).to.have.error.count.equal(2);
    });

    it('should report sticky operator if operand in parentheses', function() {
        checker.configure({ requireSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; ( x )++; (((x)))--;')).to.have.error.count.equal(2);
    });

    it('should not report separated operator', function() {
        checker.configure({ requireSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; x ++; x --;')).to.have.no.errors();
    });
});
