var Checker = require('../../lib/checker');
var assert = require('assert');
var operators = require('../../lib/utils').binaryOperators;

describe('rules/disallow-space-before-binary-operators', function() {
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
            it('should not report sticky operator for ' + sticked + ' with ' + value + ' value',
                function() {
                    checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(sticked).isEmpty());
                }
            );
            it('should report sticky operator for ' + notSticked + ' with ' + value + ' value',
                function() {
                    checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(notSticked).getErrorCount() === 1);
                }
            );
            it('should not report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' value',
                function() {
                    checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(stickedWithParenthesis).isEmpty());
                }
            );
            it('should report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' value',
                function() {
                    checker.configure({ disallowSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
                }
            );
        });
    });

    it('should not report sticky operator for ({ test :2 })', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('({ test : 2 })').isEmpty());
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
    it('should report comma operator (as separator) in function argument', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('function test(a , b){}').getErrorCount() === 1);
    });
    it('should report for assignment expression', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('x = 1').getErrorCount() === 1);
    });
    it('should report for assignment expressions', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x = 1, t = 2').getErrorCount() === 2);
    });
    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('var x = 1;').isEmpty());
    });
    it('should not report empty assignment expression', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x').isEmpty());
    });
    it('should not report error if comma not on the same line with the first operand (#467)', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('var x = [1, 2]\n  , y = 32').isEmpty());
    });
});
