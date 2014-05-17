var Checker = require('../../lib/checker');
var assert = require('assert');
var operators = require('../../lib/utils').binaryOperators;

describe('rules/disallow-space-before-binary-operators', function() {
    var checker;

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
            checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
            assert(checker.checkString(sticked).isEmpty());
        });
        it('should report sticky operator for ' + notSticked, function() {
            checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
            assert(checker.checkString(notSticked).getErrorCount() === 1);
        });
        it('should not report sticky operator for ' + stickedWithParenthesis, function() {
            checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
            assert(checker.checkString(stickedWithParenthesis).isEmpty());
        });
        it('should report sticky operator for ' + notStickedWithParenthesis, function() {
            checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
            assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
        });
    });

    it('should report sticky operator for 2 , 2 with true option', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: true });
        assert(checker.checkString('2 , 2').getErrorCount() === 1);
    });
    it('should not report sticky operator for ({ test:2 })', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('({ test:2 })').isEmpty());
    });
    it('should report sticky operator for ({ test :2 })', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('({ test : 2 })').getErrorCount() === 1);
    });
    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('test ? 1 : 2').isEmpty());
    });
    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['?'] });
        assert(checker.checkString('test ? 1 : 2').isEmpty());
    });
    it('should not report assignment operator for "a = b" without option', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('a = b').isEmpty());
    });
});
