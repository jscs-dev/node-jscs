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

    describe('exceptions', function() {
        it('should not require spaces for "for" keyword', function() {
            checker.configure({
                requireSpacesInsideParentheses: {
                    all: true,
                    except: ['var', '++']
                }
            });
            assert(checker.checkString('for (var i = 0; i < 100; i++) {}').isEmpty());
        });

        describe('"{", "}", "[", "]", "function"', function() {
            beforeEach(function() {
                checker.configure({
                    requireSpacesInsideParentheses: {
                        all: true,
                        except: ['{', '}', '[', ']', 'function']
                    }
                });
            });

            it('should allow no space between function keyword and curly brace', function() {
                assert(checker.checkString('foo(function() {});').isEmpty());
            });

            it('should allow no space between function keyword and first argument', function() {
                assert(checker.checkString('foo( test, function() {})').isEmpty());
                assert(checker.checkString('foo(test, function() {})').getErrorCount() === 1);
            });

            it('should allow no space between function keyword and second argument', function() {
                assert(checker.checkString('foo(function() {}, test )').isEmpty());
                assert(checker.checkString('foo(function() {}, test)').getErrorCount() === 1);
            });

            it('should allow no space between function keyword and first object argument', function() {
                assert(checker.checkString('foo( test, {})').isEmpty());
                assert(checker.checkString('foo(test, {})').getErrorCount() === 1);
            });

            it('should allow no space between function keyword and first array argument', function() {
                assert(checker.checkString('foo( test, [])').isEmpty());
                assert(checker.checkString('foo(test, [])').getErrorCount() === 1);
            });

            it('should not report if function is the sole argument', function() {
                assert(checker.checkString('foo(function() {})').isEmpty());
            });

            it('should not report if object is the sole argument', function() {
                assert(checker.checkString('foo({})').isEmpty());
            });

            it('should not report if array is the sole argument', function() {
                assert(checker.checkString('foo([])').isEmpty());
            });

            it('should not report if object is the sole argument', function() {
                assert(checker.checkString('foo({})').isEmpty());
            });

            it('should not report if object is not the sole argument', function() {
                assert(checker.checkString('foo( test, {} )').isEmpty());
            });
        });

    });

});
