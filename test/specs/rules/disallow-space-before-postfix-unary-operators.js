var Checker = require('../../../lib/checker');
var assert = require('assert');
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
                    assert(checker.checkString(sticked).isEmpty());
                }
            );

            it('should report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    assert(checker.checkString(notSticked).getErrorCount() === 1);
                }
            );

            it('should not report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    assert(checker.checkString(stickedWithParenthesis).isEmpty());
                }
            );

            it('should report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceBeforePostfixUnaryOperators: value });
                    assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
                }
            );
        });
    });

    it('should report separated operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x ++; x --;').getErrorCount() === 2);
    });

    it('should not report prefix operators', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; ++x;').isEmpty());
    });

    it('should not report sticky operator', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; x++; x--;').isEmpty());
    });

    it('should not report sticky operator if operand in parentheses', function() {
        checker.configure({ disallowSpaceBeforePostfixUnaryOperators: ['++', '--'] });
        assert(checker.checkString('var x = 2; (x)++; ( x )++; (((x)))--;').isEmpty());
    });
});
