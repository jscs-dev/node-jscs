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
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParentheses: 'allButNested' });
        });

        it('should allow nested parentheses', function() {
            assert(checker.checkString('(( 1, 2 ))').isEmpty());
        });
        it('should allow nested parentheses with comma operator', function() {
            assert(checker.checkString('( (1), 2 )').getErrorCount() === 2);
            assert(checker.checkString('alert( (1), 2 )').getErrorCount() === 2);
            assert(checker.checkString('if ( (1), 2 ) {}').getErrorCount() === 2);
        });
        it('should allow nested parentheses with "&&" operator', function() {
            assert(checker.checkString('( (1) && 2 )').getErrorCount() === 2);
            assert(checker.checkString('alert( (1) && 2 )').getErrorCount() === 2);
            assert(checker.checkString('if ( (1) && 2 ) {}').getErrorCount() === 2);
        });
    });

    describe('allButSolitaryPunctuators', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParentheses: 'allButSolitaryPunctuators' });
        });

        it('should allow no space between solitary punctuators', function() {
            assert(checker.checkString('foo( function() {\n  return;\n});').isEmpty());
            assert(checker.checkString('foo({\n  foo: "bar"\n}, "bar" );').isEmpty());
            assert(checker.checkString('foo({\n  foo: "bar",\n  bar: "baz"\n});').isEmpty());
        });

        it('should require spaces between nonpunctuators and parentheses', function() {
            assert(checker.checkString('foo( function() {\n  return;\n}, "bar");').getErrorCount() === 1);
            assert(checker.checkString('foo(function() {\n  return;\n}, "bar" );').getErrorCount() === 1);
            assert(checker.checkString('foo(function() {\n  return;\n}, "bar");').getErrorCount() === 2);
        });

        it('should require between simple arguments', function() {
            assert(checker.checkString('foo(a,b);').getErrorCount() === 2);
            assert(checker.checkString('foo( a,b);').getErrorCount() === 1);
            assert(checker.checkString('foo( a,b );').isEmpty());
        });

        it('should not require spaces for empty arguments list', function() {
            assert(checker.checkString('foo();').isEmpty());
        });

        it('should require spaces for grouping parentheses', function() {
            assert(checker.checkString('var test = (true ? true : false)').getErrorCount() === 2);
            assert(checker.checkString('var test = ( true ? true : false)').getErrorCount() === 1);
            assert(checker.checkString('var test = ( true ? true : false )').isEmpty());
        });

        it('should require spaces for "for" keyword', function() {
            assert(checker.checkString('for (var i = 0; i < 100; i++) {}').getErrorCount() === 2);
            assert(checker.checkString('for ( var i = 0; i < 100; i++) {}').getErrorCount() === 1);
            assert(checker.checkString('for ( var i = 0; i < 100; i++ ) {}').isEmpty());
        });

        it('should require spaces for "while" keyword', function() {
            assert(checker.checkString('while (!condition) {}').getErrorCount() === 2);
            assert(checker.checkString('while ( !condition) {}').getErrorCount() === 1);
            assert(checker.checkString('while ( !condition ) {}').isEmpty());
        });

        it('should require spaces for "try...catch" statement', function() {
            assert(checker.checkString('try {} catch(e) {}').getErrorCount() === 2);
            assert(checker.checkString('try {} catch( e) {}').getErrorCount() === 1);
            assert(checker.checkString('try {} catch( e ) {}').isEmpty());
        });
    });

});
