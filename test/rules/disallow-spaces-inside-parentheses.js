var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-spaces-inside-parentheses', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('true', function() {
        beforeEach(function() {
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
    });

    describe('"only" option', function() {
        describe('"{", "}", "[", "]", "function"', function() {
            beforeEach(function() {
                checker.configure({
                    disallowSpacesInsideParentheses: {
                        only: ['{', '}', '[', ']', 'function']
                    }
                });
            });

            describe('function', function() {
                it('should report for funarg as sole argument', function() {
                    assert(checker.checkString('foo(function() {})').isEmpty());
                    assert(checker.checkString('foo( function() {} )').getErrorCount() === 2);
                });

                it('should report for funarg as first argument', function() {
                    assert(checker.checkString('foo(function() {}, test)').isEmpty());
                    assert(checker.checkString('foo( function() {}, test)').getErrorCount() === 1);
                    assert(checker.checkString('foo( function() {}, test )').getErrorCount() === 1);
                });

                it('should report for funarg as second argument', function() {
                    assert(checker.checkString('foo(test, function() {})').isEmpty());
                    assert(checker.checkString('foo(test, function() {} )').getErrorCount() === 1);
                    assert(checker.checkString('foo( test, function() {} )').getErrorCount() === 1);
                });
            });

            describe('{}', function() {
                it('should report if object is the sole argument', function() {
                    assert(checker.checkString('foo({})').isEmpty());
                    assert(checker.checkString('foo( {} )').getErrorCount() === 2);
                });

                it('should report for if object is first argument', function() {
                    assert(checker.checkString('foo( test, {})').isEmpty());
                    assert(checker.checkString('foo(test, {} )').getErrorCount() === 1);
                    assert(checker.checkString('foo( test, {} )').getErrorCount() === 1);
                });

                it('should report for if object is second argument', function() {
                    assert(checker.checkString('foo({}, test)').isEmpty());
                    assert(checker.checkString('foo( {}, test)').getErrorCount() === 1);
                    assert(checker.checkString('foo( {}, test )').getErrorCount() === 1);
                });
                it('should report if there two object arguments', function() {
                    assert(checker.checkString('foo({}, {})').isEmpty());
                    assert(checker.checkString('foo( {}, {})').getErrorCount() === 1);
                    assert(checker.checkString('foo( {}, {} )').getErrorCount() === 2);
                });
            });

            describe('[]', function() {
                it('should report if array is the sole argument', function() {
                    assert(checker.checkString('foo([])').isEmpty());
                    assert(checker.checkString('foo( [] )').getErrorCount() === 2);
                });

                it('should report for if array is first argument', function() {
                    assert(checker.checkString('foo( test, [])').isEmpty());
                    assert(checker.checkString('foo(test, [] )').getErrorCount() === 1);
                    assert(checker.checkString('foo( test, [] )').getErrorCount() === 1);
                });

                it('should report for if array is second argument', function() {
                    assert(checker.checkString('foo([], test)').isEmpty());
                    assert(checker.checkString('foo( [], test)').getErrorCount() === 1);
                    assert(checker.checkString('foo( [], test )').getErrorCount() === 1);
                });
                it('should report if there two array arguments', function() {
                    assert(checker.checkString('foo([], [])').isEmpty());
                    assert(checker.checkString('foo( [], [])').getErrorCount() === 1);
                    assert(checker.checkString('foo( [], [] )').getErrorCount() === 2);
                });

                it('should report entity that look like array case', function() {
                    assert(checker.checkString('foo(test[i] )').isEmpty());
                });
            });
        });
    });
});
