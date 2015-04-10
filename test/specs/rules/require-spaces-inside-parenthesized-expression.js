var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-parenthesized-expression', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParenthesizedExpression: true });
        });

        it('should report required space after opening grouping parentheses', function() {
            assert(checker.checkString('(1 + 2 ) * 3').getErrorCount() === 1);
            assert(checker.checkString('if (1 + 2 )\n    3').isEmpty());
            assert(checker.checkString('function my(a, b ) {  }').isEmpty());
            assert(checker.checkString('my(a, b )').isEmpty());
        });

        it('should report required space before closing grouping parentheses', function() {
            assert(checker.checkString('( 1 + 2) * 3').getErrorCount() === 1);
            assert(checker.checkString('if ( 1 + 2)\n    3').isEmpty());
            assert(checker.checkString('function my( a, b) {  }').isEmpty());
            assert(checker.checkString('my( a, b)').isEmpty());
        });

        it('should report required space in both cases', function() {
            assert(checker.checkString('(1 + 2) * 3').getErrorCount() === 2);
            assert(checker.checkString('if (1 + 2)\n    3').isEmpty());
            assert(checker.checkString('function my(a, b) {  }').isEmpty());
            assert(checker.checkString('my(a, b)').isEmpty());
            assert(checker.checkString('id = function(v) { return(v); }').getErrorCount() === 2);
            assert(checker.checkString('(my(a), 1)').getErrorCount() === 2);
            assert(checker.checkString('do {} while (false)').isEmpty());
            assert(checker.checkString('switch (a) { case(b): c }').getErrorCount() === 2);
            assert(checker.checkString('(a)\n{ fn(); }').getErrorCount() === 2);
        });

        it('should not report with spaces', function() {
            assert(checker.checkString('( 1 + 2 ) * 3').isEmpty());
            assert(checker.checkString('id = function(v) { return( v ); }').isEmpty());
            assert(checker.checkString('( my(a), 1 )').isEmpty());
            assert(checker.checkString('switch (a) { case( b ): c }').isEmpty());
            assert(checker.checkString('( a )\n{ fn(); }').isEmpty());
        });

        it('should not report with closing parentheses on new line', function() {
            assert(checker.checkString('(\n        0\n    )').isEmpty());
        });

        it('should report when a comment is after opening parentheses', function() {
            assert(checker.checkString('(/* comment */ el )').getErrorCount() === 1);
            assert(checker.checkString('(// comment\n el )').getErrorCount() === 1);
        });

        it('should report when a comment is before closing parentheses', function() {
            assert(checker.checkString('( i/* comment */)').getErrorCount() === 1);
        });

        it('should allow a comment with space', function() {
            assert(checker.checkString('( /* comment */ el /* comment */ )').isEmpty());
            assert(checker.checkString('( // comment\n el /* comment */ )').isEmpty());
        });

        it('should report nested parentheses', function() {
            assert(checker.checkString('((1, 2))').getErrorCount() === 4);
            assert(checker.checkString('if ((1 + 2))\n    3').getErrorCount() === 2);
            assert(checker.checkString('(my)((a),(b))').getErrorCount() === 6);
        });

        it('should not report with nested spaces', function() {
            assert(checker.checkString('( ( 1, 2 ) )').isEmpty());
            assert(checker.checkString('if (( 1 + 2 ))\n    3').isEmpty());
            assert(checker.checkString('( my )(( a ),( b ))').isEmpty());
        });
    });

    describe('exceptions', function() {
        it('should not report for function or object when so configured', function() {
            checker.configure({
                requireSpacesInsideParenthesizedExpression: {
                    allExcept: ['{', '}', 'function']
                }
            });

            assert(checker.checkString('([])').getErrorCount() === 2);
            assert(checker.checkString('("string")').getErrorCount() === 2);
            assert(checker.checkString('(i)').getErrorCount() === 2);
            assert(checker.checkString('(1)').getErrorCount() === 2);
            assert(checker.checkString('(function() {}, {})').isEmpty());
        });

        it('should not report for object when so configured', function() {
            checker.configure({
                requireSpacesInsideParenthesizedExpression: {
                    allExcept: ['{', '}']
                }
            });

            assert(checker.checkString('([])').getErrorCount() === 2);
            assert(checker.checkString('("string")').getErrorCount() === 2);
            assert(checker.checkString('(i)').getErrorCount() === 2);
            assert(checker.checkString('(1)').getErrorCount() === 2);
            assert(checker.checkString('(function() {}, {})').getErrorCount() === 1);
            assert(checker.checkString('( function() {}, {})').isEmpty());
        });

        it('should consider comments', function() {
            checker.configure({
                requireSpacesInsideParenthesizedExpression: {
                    allExcept: ['//', '/*', '*/']
                }
            });

            assert(checker.checkString('(foo)').getErrorCount() === 2);
            assert(checker.checkString('(/**/ foo /**/)').isEmpty());
            assert(checker.checkString('(//\n foo //\n)').isEmpty());
            assert(checker.checkString('(/*comment*/ foo /*comment*/)').isEmpty());
            assert(checker.checkString('(//comment\n foo //comment\n)').isEmpty());
        });

        it('should differentiate comments', function() {
            checker.configure({
                requireSpacesInsideParenthesizedExpression: {
                    allExcept: ['/*', '*/']
                }
            });

            assert(checker.checkString('(foo)').getErrorCount() === 2);
            assert(checker.checkString('(/**/ foo /**/)').isEmpty());
            assert(checker.checkString('(//\n foo //\n)').getErrorCount() === 1);
            assert(checker.checkString('(/*comment*/ foo /*comment*/)').isEmpty());
            assert(checker.checkString('(//comment\n foo //comment\n)').getErrorCount() === 1);
        });

        it('should not look inside comments', function() {
            checker.configure({
                requireSpacesInsideParenthesizedExpression: {
                    allExcept: ['[', ']']
                }
            });

            assert(checker.checkString('([ foo ])').isEmpty());
            assert(checker.checkString('(/*[*/ foo /*]*/)').getErrorCount() === 2);
            assert(checker.checkString('(//[\n foo )').getErrorCount() === 1);
        });
    });

    describe('invalid configuration', function() {
        it('should not accept objects without at least one valid key', function() {
            assert.throws(function() {
                    checker.configure({ requireSpacesInsideParenthesizedExpression: {} });
                },
                assert.AssertionError
            );
        });

        it('should not accept non-boolean non-objects', function() {
            assert.throws(function() {
                    checker.configure({ requireSpacesInsideParenthesizedExpression: 'true' });
                },
                assert.AssertionError
            );
        });
    });
});
