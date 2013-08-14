var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-space-before-binary-operators', function() {

    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    
    it('should not report sticky operator for "2+2"', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['+'] });
        assert(checker.checkString('var x = 2+2;').isEmpty());
    });
    it('should report separated operator for "2 +2"', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['+'] });
        assert(checker.checkString('var x = 2 +2;').getErrorCount() === 1);
    });
    it('should not report sticky operator for "a = (a)+ b"', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['+'] });
        assert(checker.checkString('a = (a)+ b').isEmpty());
    });
    it('should report separated operator for "a = (a) + (b)"', function() {
        checker.configure({ disallowSpaceBeforeBinaryOperators: ['+'] });
        assert(checker.checkString('a = (a) + (b)').getErrorCount() === 1);
    });

});
