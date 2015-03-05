var Checker = require('../../../lib/checker');
var assert = require('assert');
var operators = require('../../../lib/utils').unaryOperators;

describe('rules/require-space-after-prefix-unary-operators', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        var sticked = 'var test;' + operator + 'test';
        var stickedWithParenthesis = 'var test;' + operator + '(test)';

        var notSticked = 'var test;' + operator + ' test';
        var notStickedWithParenthesis = 'var test;' + operator + ' (test)';

        [[operator], true].forEach(function(value) {
            it('should report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    assert(checker.checkString(sticked).getErrorCount() === 1);
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    assert(checker.checkString(notSticked).isEmpty());
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    assert(checker.checkString(stickedWithParenthesis).getErrorCount() === 1);
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    assert(checker.checkString(notStickedWithParenthesis).isEmpty());
                }
            );
        });
    });

    it('should report sticky operator if operand in parentheses', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        assert(checker.checkString('var x = ~(0); ++(((x))); -( x ); !(++( x ));').getErrorCount() === 5);
    });

    it('should not report consecutive operators (#405)', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['!'] });
        assert(checker.checkString('!~test;').isEmpty());
        assert(checker.checkString('!~test;').isEmpty());
        assert(checker.checkString('!++test;').isEmpty());
    });
});
