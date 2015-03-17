var Checker = require('../../../lib/checker');
var assert = require('assert');
var operators = require('../../../lib/utils').binaryOperators.filter(function(operator) {
    return operator !== ',';
});

describe('rules/require-space-before-binary-operators', function() {
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

            it('should report sticky operator for ' + sticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(sticked).getErrorCount() === 1);
                }
            );

            it('should not report sticky operator for ' + notSticked + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(notSticked).isEmpty());
                }
            );

            it('should report sticky operator for ' + stickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(stickedWithParenthesis).getErrorCount() === 1);
                }
            );

            it('should not report sticky operator for ' + notStickedWithParenthesis + ' with ' + value + ' option',
                function() {
                    checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                    assert(checker.checkString(notStickedWithParenthesis).isEmpty());
                }
            );

            it('should highlight the end of the ' + operator + ' operator', function() {
                checker.configure({ requireSpaceBeforeBinaryOperators: [operator] });
                var error = checker.checkString(sticked).getErrorList()[0];
                assert(error.line === 1);
                assert(error.column === 14);
                assert(error.message === ('Operator ' + operator + ' should not stick to preceding expression'));
            });
        });
    });

    it('should not report sticky operator for ({ test:2 })', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('({ test:2 })').isEmpty());
    });

    it('should not report sticky operator ":" in ternary', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [':'] });
        assert(checker.checkString('test?1:2').isEmpty());
    });

    it('should not report sticky operator "?" in ternary', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['?'] });
        assert(checker.checkString('test?1:2').isEmpty());
    });

    it('should not report assignment operator for "a=b" without option', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('a=b').isEmpty());
    });

    it('should report comma operator (as separator) in function argument', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('function test(a,b){}').getErrorCount() === 1);
    });

    it('should report for assignment expression', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x=1').getErrorCount() === 1);
    });

    it('should report for assignment expressions', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x=1, t=2').getErrorCount() === 2);
    });

    it('should not report for assignment expressions without "=" sign', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: ['='] });
        assert(checker.checkString('var x,z;').isEmpty());
    });

    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: [','] });
        assert(checker.checkString('var x=1;').isEmpty());
    });

    it('should not report for comma with "true" value', function() {
        checker.configure({ requireSpaceBeforeBinaryOperators: true });
        assert(checker.checkString('1,2;').isEmpty());
    });
});
