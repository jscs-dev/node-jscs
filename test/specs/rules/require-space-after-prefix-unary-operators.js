var Checker = require('../../../lib/checker');
var expect = require('chai').expect;
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
                    expect(checker.checkString(sticked))
                      .to.have.one.validation.error.from('requireSpaceAfterPrefixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(notSticked)).to.have.no.errors();
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(stickedWithParenthesis))
                      .to.have.one.validation.error.from('requireSpaceAfterPrefixUnaryOperators');
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceAfterPrefixUnaryOperators: value });
                    expect(checker.checkString(notStickedWithParenthesis)).to.have.no.errors();
                }
            );
        });
    });

    it('should report sticky operator if operand in parentheses', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['-', '~', '!', '++'] });
        expect(checker.checkString('var x = ~(0); ++(((x))); -( x ); !(++( x ));')).to.have.error.count.equal(5);
    });

    it('should not report consecutive operators (#405)', function() {
        checker.configure({ requireSpaceAfterPrefixUnaryOperators: ['!'] });
        expect(checker.checkString('!~test;')).to.have.no.errors();
        expect(checker.checkString('!~test;')).to.have.no.errors();
        expect(checker.checkString('!++test;')).to.have.no.errors();
    });
});
