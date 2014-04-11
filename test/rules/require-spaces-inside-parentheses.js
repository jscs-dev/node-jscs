var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-parentheses', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('all', function() {
        it('should report required space after opening round parentheses', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('(1 + 2 ) * 3').getErrorCount() === 1);
            assert(checker.checkString('if (1 + 2 )\n    3').getErrorCount() === 1);
            assert(checker.checkString('function my(a, b ) {  }').getErrorCount() === 1);
        });
        it('should report required space before closing round parentheses', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('( 1 + 2) * 3').getErrorCount() === 1);
            assert(checker.checkString('if ( 1 + 2)\n    3').getErrorCount() === 1);
            assert(checker.checkString('function my( a, b) {  }').getErrorCount() === 1);
        });
        it('should report required space in both cases', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('(1 + 2) * 3').getErrorCount() === 2);
            assert(checker.checkString('if (1 + 2)\n    3').getErrorCount() === 2);
            assert(checker.checkString('function my(a, b) {  }').getErrorCount() === 2);
        });
        it('should allow empty round parentheses with no space', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('function my() {  }').isEmpty());
        });
        it('should not report with spaces', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('( 1 + 2 ) * 3').isEmpty());
            assert(checker.checkString('if ( 1 + 2 )\n    3').isEmpty());
            assert(checker.checkString('function my( a, b ) {  }').isEmpty());
        });
        it('should not report with closing round parentheses on new line', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('    myFunc(\n        withLongArguments\n    )').isEmpty());
        });
        it('should report when a comment is after opening round parentheses', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('function x(/* comment */ el ) {  }').getErrorCount() === 1);
        });
        it('should report when a comment is before closes round parentheses', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('function x( i/* comment */) {  }').getErrorCount() === 1);
        });
        it('should allow a comment with space', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('function x( /* comment */ el /* comment */ ) {  }').isEmpty());
        });
        it('should report nested parentheses when configured', function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
            assert(checker.checkString('(( 1, 2 ))').getErrorCount() === 2);
        });
    });

    describe('allButNested', function() {
        it('should allow nested parentheses when configured', function() {
            checker.configure({ requireSpacesInsideParentheses: 'allButNested' });
            assert(checker.checkString('(( 1, 2 ))').isEmpty());
        });
    });

});
