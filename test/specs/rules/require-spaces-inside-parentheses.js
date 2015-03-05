var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-spaces-inside-parentheses', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('all', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
        });

        it('should report required space after opening round parentheses', function() {
            assert(checker.checkString('(1 + 2 ) * 3').getErrorCount() === 1);
            assert(checker.checkString('if (1 + 2 )\n    3').getErrorCount() === 1);
            assert(checker.checkString('function my(a, b ) {  }').getErrorCount() === 1);
        });

        it('should report required space before closing round parentheses', function() {
            assert(checker.checkString('( 1 + 2) * 3').getErrorCount() === 1);
            assert(checker.checkString('if ( 1 + 2)\n    3').getErrorCount() === 1);
            assert(checker.checkString('function my( a, b) {  }').getErrorCount() === 1);
        });

        it('should report required space in both cases', function() {
            assert(checker.checkString('(1 + 2) * 3').getErrorCount() === 2);
            assert(checker.checkString('if (1 + 2)\n    3').getErrorCount() === 2);
            assert(checker.checkString('function my(a, b) {  }').getErrorCount() === 2);
        });

        it('should allow empty round parentheses with no space', function() {
            assert(checker.checkString('function my() {  }').isEmpty());
        });

        it('should not report with spaces', function() {
            assert(checker.checkString('( 1 + 2 ) * 3').isEmpty());
            assert(checker.checkString('if ( 1 + 2 )\n    3').isEmpty());
            assert(checker.checkString('function my( a, b ) {  }').isEmpty());
        });

        it('should not report with closing round parentheses on new line', function() {
            assert(checker.checkString('    myFunc(\n        withLongArguments\n    )').isEmpty());
        });

        it('should report when a comment is after opening round parentheses', function() {
            assert(checker.checkString('function x(/* comment */ el ) {  }').getErrorCount() === 1);
        });

        it('should report when a comment is before closes round parentheses', function() {
            assert(checker.checkString('function x( i/* comment */) {  }').getErrorCount() === 1);
        });

        it('should allow a comment with space', function() {
            assert(checker.checkString('function x( /* comment */ el /* comment */ ) {  }').isEmpty());
        });

        it('should report nested parentheses when configured', function() {
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

            describe('function', function() {
                it('should not report for funarg', function() {
                    assert(checker.checkString('foo(function() {});').isEmpty());
                });

                it('should report for funarg as first argument', function() {
                    assert(checker.checkString('foo(function() {}, test )').isEmpty());
                    assert(checker.checkString('foo(function() {}, test)').getErrorCount() === 1);
                });

                it('should report for funarg as second argument', function() {
                    assert(checker.checkString('foo( test, function() {})').isEmpty());
                    assert(checker.checkString('foo(test, function() {})').getErrorCount() === 1);
                });
            });

            describe('{}', function() {
                it('should not report if object is the sole argument', function() {
                    assert(checker.checkString('foo({})').isEmpty());
                });

                it('should not report if there is two object arguments', function() {
                    assert(checker.checkString('foo({}, {})').isEmpty());
                });

                it('should not report if object as first argument', function() {
                    assert(checker.checkString('foo({}, test )').isEmpty());
                    assert(checker.checkString('foo({}, test)').getErrorCount() === 1);
                });

                it('should report for object as second argument', function() {
                    assert(checker.checkString('foo( test, {})').isEmpty());
                    assert(checker.checkString('foo(test, {})').getErrorCount() === 1);
                });
            });

            describe('[]', function() {
                it('should not report if array is the sole argument', function() {
                    assert(checker.checkString('foo([])').isEmpty());
                });

                it('should not report if there is two object arguments', function() {
                    assert(checker.checkString('foo([], [])').isEmpty());
                });

                it('should not report if object as first argument', function() {
                    assert(checker.checkString('foo([], test )').isEmpty());
                    assert(checker.checkString('foo([], test)').getErrorCount() === 1);
                });

                it('should report for object as second argument', function() {
                    assert(checker.checkString('foo( test, [])').isEmpty());
                    assert(checker.checkString('foo(test, [])').getErrorCount() === 1);
                });

                it('should report entity that look like array case', function() {
                    assert(checker.checkString('foo( test[i] )').isEmpty());
                    assert(checker.checkString('foo( test[i])').getErrorCount() === 1);
                });
            });

            describe('cycles:"for", "for..of", "while", "do..while"', function() {
                it('should report spacing problem for "for"', function() {
                    assert(checker.checkString('for(var i = 0; i < l; i++) {}').getErrorCount() === 2);
                    assert(checker.checkString('for( var i = 0; i < l; i++ ) {}').isEmpty());
                });

                it('should report spacing problem for "for..of"', function() {
                    assert(checker.checkString('for(var i in a) {};').getErrorCount() === 2);
                    assert(checker.checkString('for( var i in a ) {}').isEmpty());
                });

                it('should report spacing problem for "while"', function() {
                    assert(checker.checkString('while(condition) {}').getErrorCount() === 2);
                    assert(checker.checkString('while( condition ) {}').isEmpty());
                });

                it('should report spacing problem for "do..while"', function() {
                    assert(checker.checkString('do{} while(condition);').getErrorCount() === 2);
                    assert(checker.checkString('do{} while( condition );').isEmpty());
                });
            });
        });

        describe('bool', function() {
            it('should not configure', function() {
                assert.throws(function() {
                        checker.configure({ requireSpacesInsideParentheses: true });
                    },
                    assert.AssertionError
                );
            });
        });
    });
});
