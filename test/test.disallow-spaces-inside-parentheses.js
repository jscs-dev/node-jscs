var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-parentheses', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report illegal space after opening round bracket', function() {
        checker.configure({ disallowSpacesInsideParentheses: true });
        assert(checker.checkString('( 1 + 2) * 3').getErrorCount() === 1);
        assert(checker.checkString('if ( 1 + 2)\n    3').getErrorCount() === 1);
        assert(checker.checkString('function my( a, b) {  }').getErrorCount() === 1);
    });
    it('should report illegal space before closing round bracket', function() {
        checker.configure({ disallowSpacesInsideParentheses: true });
        assert(checker.checkString('(1 + 2 ) * 3').getErrorCount() === 1);
        assert(checker.checkString('if (1 + 2 )\n    3').getErrorCount() === 1);
        assert(checker.checkString('function my(a, b ) {  }').getErrorCount() === 1);
    });
    it('should report illegal space in both cases', function() {
        checker.configure({ disallowSpacesInsideParentheses: true });
        assert(checker.checkString('( 1 + 2 ) * 3').getErrorCount() === 2);
        assert(checker.checkString('if ( 1 + 2 )\n    3').getErrorCount() === 2);
        assert(checker.checkString('function my( ) {  }').getErrorCount() === 2);
        assert(checker.checkString('function my( a, b ) {  }').getErrorCount() === 2);
    });
    it('should not report with no spaces', function() {
        checker.configure({ disallowSpacesInsideParentheses: true });
        assert(checker.checkString('(1 + 2) * 3').isEmpty());
        assert(checker.checkString('if (1 + 2)\n    3').isEmpty());
        assert(checker.checkString('function my() {  }').isEmpty());
        assert(checker.checkString('function my(a, b) {  }').isEmpty());
    });
    it('should not report with closing round bracket on new line', function() {
        checker.configure({ disallowSpacesInsideParentheses: true });
        assert(checker.checkString('    myFunc(\n        withLongArguments\n    )').isEmpty());
    });

});
