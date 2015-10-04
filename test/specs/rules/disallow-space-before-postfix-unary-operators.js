var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').incrementAndDecrementOperators;

describe('rules/disallow-space-before-postfix-unary-operators', function() {
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
            it('should not report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(sticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(notSticked))
                      .to.have.one.validation.error.from('disallowSpaceBeforePostfixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(stickedWithParenthesis)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    expect(checker.checkString(notStickedWithParenthesis))
                      .to.have.one.validation.error.from('disallowSpaceBeforePostfixUnaryOperators');
                }
            );
        });
    });

    it('should report separated operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; x ++; x --;')).to.have.error.count.equal(2);
    });

    it('should not report prefix operators', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; ++x;')).to.have.no.errors();
    });

    it('should not report sticky operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; x++; x--;')).to.have.no.errors();
    });

    it('should not report sticky operator if operand in parentheses', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; (x)++; ( x )++; (((x)))--;')).to.have.no.errors();
    });
});
