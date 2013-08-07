var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-left-sticked-operators', function() {

    var x;

    (x) = 2;

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    
    describe('ConditionalExpression', function() {
        it('should report sticky ? operator', function() {
            checker.configure({ disallowLeftStickedOperators: ['?'] });
            assert(checker.checkString('var x = y? z : w;').getErrorCount() === 1);
        });
        it('should report sticky : operator', function() {
            checker.configure({ disallowLeftStickedOperators: [':'] });
            assert(checker.checkString('var x = y ? z: w;').getErrorCount() === 1);
        });
        it('should not report sticky ?: operator without option', function() {
            checker.configure({ disallowLeftStickedOperators: ['+'] });
            assert(checker.checkString('var x = y? z: w;').isEmpty());
        });
        it('should not report for "(y) ? z : w"', function() {
            checker.configure({ disallowLeftStickedOperators: ['?', ':'] });
            assert(checker.checkString('var x = (y) ? z : w;').isEmpty());
        });
        it('should not report for "y ? (z) : w"', function() {
            checker.configure({ disallowLeftStickedOperators: ['?', ':'] });
            assert(checker.checkString('var x = y ? (z) : w;').isEmpty());
        });
    });
    
    describe('BinaryExpression', function() {
        it('should report sticky operator for "2+2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['+'] });
            assert(checker.checkString('var x = 2+2;').getErrorCount() === 1);
        });
        it('should not report separated operator for "2 +2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['+'] });
            assert(checker.checkString('var x = 2 +2;').isEmpty());
        });
        it('should not report for "a = (a) + (b)"', function() {
            checker.configure({ disallowLeftStickedOperators: ['+'] });
            assert(checker.checkString('a = (a) + (b)').isEmpty());
        });
        it('should not report sticky operator for "2+2" without option', function() {
            checker.configure({ disallowLeftStickedOperators: ['-'] });
            assert(checker.checkString('var x = 2+2;').isEmpty());
        });
    });

    describe('AssignmentExpression', function() {
        it('should report sticky operator for "x=2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['='] });
            assert(checker.checkString('x=2;').getErrorCount() === 1);
        });
        it('should not report separated operator for "x =2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['='] });
            assert(checker.checkString('x =2;').isEmpty());
        });
    });

    describe('VariableDeclaration', function() {
        it('should report sticky operator for "var x=2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['='] });
            assert(checker.checkString('var x=2;').getErrorCount() === 1);
        });
        it('should not report separated operator for "var x =2"', function() {
            checker.configure({ disallowLeftStickedOperators: ['='] });
            assert(checker.checkString('var x =2;').isEmpty());
        });
        it('should not report for "var checker;"', function() {
            checker.configure({ disallowLeftStickedOperators: ['='] });
            assert(checker.checkString('var checker;').isEmpty());
        });
    });

    it('should not report if sticked operator is UnaryExpression', function() {
        checker.configure({ disallowLeftStickedOperators: ['-'] });
        assert(checker.checkString('arr.slice(-2)').isEmpty());
    });
});
