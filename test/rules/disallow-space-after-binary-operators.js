var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-after-binary-operators', function() {
    var checker;
    var operators = [

        // assignment operators
        '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
        '&=', '|=', '^=', '+=',

        '+', '-', '*', '/', '%', '<<', '>>', '>>>', '&',
        '|', '^', '&&', '||', '===', '==', '>=',
        '<=', '<', '>', '!=', '!==',

        ','
    ];

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function( operator ) {
        var sticked = 'var test; test' + operator + '2';
        var stickedWithParenthesis = 'var test; (test)' + operator + '(2)';

        var notSticked = 'var test; test ' + operator + ' 2';
        var notStickedWithParenthesis = 'var test; (test) ' + operator + ' (2)';

        it('should not report sticky operator for ' + sticked, function() {
            checker.configure({ disallowSpaceAfterBinaryOperators: [operator] });
            assert(checker.checkString(sticked).isEmpty());
        });
        it('should report sticky operator for ' + notSticked, function() {
            checker.configure({ disallowSpaceAfterBinaryOperators: [operator] });
            assert(checker.checkString(notSticked).getErrorCount() === 1);
        });
        it('should not report sticky operator for ' + stickedWithParenthesis, function() {
            checker.configure({ disallowSpaceAfterBinaryOperators: [operator] });
            assert(checker.checkString(stickedWithParenthesis).isEmpty());
        });
        it('should report sticky operator for ' + notStickedWithParenthesis, function() {
            checker.configure({ disallowSpaceAfterBinaryOperators: [operator] });
            assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
        });
    });

    it('should not report sticky operator for ({ test:2 })', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [':'] });
        assert(checker.checkString('({ test:2 })').isEmpty());
    });
    it('should report sticky operator for ({ test :2 })', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [':'] });
        assert(checker.checkString('({ test : 2 })').getErrorCount() === 1);
    });
    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [':'] });
        assert(checker.checkString('test ? 1 : 2').isEmpty());
    });
    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: ['?'] });
        assert(checker.checkString('test ? 1 : 2').isEmpty());
    });
    it('should not report assignment operator for "a = b" without option', function() {
        checker.configure({ disallowSpaceAfterBinaryOperators: [','] });
        assert(checker.checkString('a = b').isEmpty());
    });
});
