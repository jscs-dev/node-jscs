var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
var operators = require('../../../lib/utils').unaryOperators;

describe('rules/disallow-space-after-prefix-unary-operators', function() {
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
            it('should not report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(sticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(notSticked))
                      .to.have.one.validation.error.from('disallowSpaceAfterPrefixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(stickedWithParenthesis)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ disallowSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(notStickedWithParenthesis))
                      .to.have.one.validation.error.from('disallowSpaceAfterPrefixUnaryOperators');
                }
            );
        });
    });

    it('should report separated operator', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        expect(checker.checkString('var x = ~ 0; ++ x; - x; ! ++ x;')).to.have.error.count.equal(5);
    });

    it('should not report postfix operators', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['++', '--'] });
        expect(checker.checkString('var x = 2; x++;')).to.have.no.errors();
    });

    it('should not report sticky operator', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        expect(checker.checkString('var x = ~0; ++x; -x; !++x;')).to.have.no.errors();
    });

    it('should not report sticky operator if operand in parentheses', function() {
        checker.configure({ disallowSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        expect(checker.checkString('var x = ~(0); ++( x ); -(((x))); !( ++((x)) );')).to.have.no.errors();
    });
});
