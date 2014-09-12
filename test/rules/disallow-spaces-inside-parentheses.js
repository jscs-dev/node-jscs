var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-parentheses', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowSpacesInsideParentheses: true });
    });

    it('should report illegal space after opening round bracket', function() {
        assert(checker.checkString('( 1 + 2) * 3').getErrorCount() === 1);
        assert(checker.checkString('if ( 1 + 2)\n    3').getErrorCount() === 1);
        assert(checker.checkString('function my( a, b) {  }').getErrorCount() === 1);
    });

    it('should report illegal space before closing round bracket', function() {
        assert(checker.checkString('(1 + 2 ) * 3').getErrorCount() === 1);
        assert(checker.checkString('if (1 + 2 )\n    3').getErrorCount() === 1);
        assert(checker.checkString('function my(a, b ) {  }').getErrorCount() === 1);
    });

    it('should report illegal space in both cases', function() {
        assert(checker.checkString('( 1 + 2 ) * 3').getErrorCount() === 2);
        assert(checker.checkString('if ( 1 + 2 )\n    3').getErrorCount() === 2);
        assert(checker.checkString('function my( ) {  }').getErrorCount() === 2);
        assert(checker.checkString('function my( a, b ) {  }').getErrorCount() === 2);
    });

    it('should not report with no spaces', function() {
        assert(checker.checkString('(1 + 2) * 3').isEmpty());
        assert(checker.checkString('if (1 + 2)\n    3').isEmpty());
        assert(checker.checkString('function my() {  }').isEmpty());
        assert(checker.checkString('function my(a, b) {  }').isEmpty());
    });

    it('should not report with closing round bracket on new line', function() {
        assert(checker.checkString('    myFunc(\n        withLongArguments\n    )').isEmpty());
    });

    it('should not report when a comment is present', function() {
        assert(checker.checkString('function x(el/* comment */, i/* comment */) {  }').isEmpty());
        assert(checker.checkString('function x(el /* comment */, i /* comment */) {  }').isEmpty());
    });

    it('should not report with a regex is present #(629)', function() {
        function foo() {
            var direction = 'foo'.match(/(\w+)Number/)[1];
        }

        assert(checker.checkString(foo.toString()).isEmpty());
    });
});
