var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-spaces-inside-parentheses', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('all', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParentheses: 'all' });
        });

        it('should report required space after opening round parentheses', function() {
            expect(checker.checkString('(1 + 2 ) * 3'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('if (1 + 2 )\n    3'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('function my(a, b ) {  }'))
                .to.have.one.error.from('ruleName');
        });

        it('should report required space before closing round parentheses', function() {
            expect(checker.checkString('( 1 + 2) * 3'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('if ( 1 + 2)\n    3'))
                .to.have.one.error.from('ruleName');
            expect(checker.checkString('function my( a, b) {  }'))
                .to.have.one.error.from('ruleName');
        });

        it('should report required space in both cases', function() {
            expect(checker.checkString('(1 + 2) * 3')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('if (1 + 2)\n    3')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('function my(a, b) {  }')).to.have.validation.error.count.which.equals(2);
        });

        it('should allow empty round parentheses with no space', function() {
            expect(checker.checkString('function my() {  }')).to.have.no.errors();
        });

        it('should not report with spaces', function() {
            expect(checker.checkString('( 1 + 2 ) * 3')).to.have.no.errors();
            expect(checker.checkString('if ( 1 + 2 )\n    3')).to.have.no.errors();
            expect(checker.checkString('function my( a, b ) {  }')).to.have.no.errors();
        });

        it('should not report with closing round parentheses on new line', function() {
            expect(checker.checkString('    myFunc(\n        withLongArguments\n    )')).to.have.no.errors();
        });

        it('should report when a comment is after opening round parentheses', function() {
            expect(checker.checkString('function x(/* comment */ el ) {  }'))
            .to.have.one.error.from('ruleName');
        });

        it('should report when a comment is before closes round parentheses', function() {
            expect(checker.checkString('function x( i/* comment */) {  }'))
                .to.have.one.error.from('ruleName');
        });

        it('should allow a comment with space', function() {
            expect(checker.checkString('function x( /* comment */ el /* comment */ ) {  }')).to.have.no.errors();
        });

        it('should report nested parentheses when configured', function() {
            expect(checker.checkString('(( 1, 2 ))')).to.have.validation.error.count.which.equals(2);
        });
    });

    describe.skip('allButNested', function() {
        beforeEach(function() {
            checker.configure({ requireSpacesInsideParentheses: 'allButNested' });
        });

        it('should allow nested parentheses', function() {
            expect(checker.checkString('(( 1, 2 ))')).to.have.no.errors();
        });

        it('should allow nested parentheses with comma operator', function() {
            expect(checker.checkString('( (1), 2 )')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('alert( (1), 2 )')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('if ( (1), 2 ) {}')).to.have.validation.error.count.which.equals(2);
        });

        it('should allow nested parentheses with "&&" operator', function() {
            expect(checker.checkString('( (1) && 2 )')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('alert( (1) && 2 )')).to.have.validation.error.count.which.equals(2);
            expect(checker.checkString('if ( (1) && 2 ) {}')).to.have.validation.error.count.which.equals(2);
        });
    });

    describe.skip('exceptions', function() {
        it('should not require spaces for "for" keyword', function() {
            checker.configure({
                requireSpacesInsideParentheses: {
                    all: true,
                    except: ['var', '++']
                }
            });
            expect(checker.checkString('for (var i = 0; i < 100; i++) {}')).to.have.no.errors();
        });

        describe.skip('"{", "}", "[", "]", "function"', function() {
            beforeEach(function() {
                checker.configure({
                    requireSpacesInsideParentheses: {
                        all: true,
                        except: ['{', '}', '[', ']', 'function']
                    }
                });
            });

            describe.skip('function', function() {
                it('should not report for funarg', function() {
                    expect(checker.checkString('foo(function() {});')).to.have.no.errors();
                });

                it('should report for funarg as first argument', function() {
                    expect(checker.checkString('foo(function() {}, test )')).to.have.no.errors();
                    expect(checker.checkString('foo(function() {}, test)'))
            .to.have.one.error.from('ruleName');
                });

                it('should report for funarg as second argument', function() {
                    expect(checker.checkString('foo( test, function() {})')).to.have.no.errors();
                    expect(checker.checkString('foo(test, function() {})'))
                        .to.have.one.error.from('ruleName');
                });
            });

            describe.skip('{}', function() {
                it('should not report if object is the sole argument', function() {
                    expect(checker.checkString('foo({})')).to.have.no.errors();
                });

                it('should not report if there is two object arguments', function() {
                    expect(checker.checkString('foo({}, {})')).to.have.no.errors();
                });

                it('should not report if object as first argument', function() {
                    expect(checker.checkString('foo({}, test )')).to.have.no.errors();
                    expect(checker.checkString('foo({}, test)'))
                        .to.have.one.error.from('ruleName');
                });

                it('should report for object as second argument', function() {
                    expect(checker.checkString('foo( test, {})')).to.have.no.errors();
                    expect(checker.checkString('foo(test, {})'))
                        .to.have.one.error.from('ruleName');
                });
            });

            describe.skip('[]', function() {
                it('should not report if array is the sole argument', function() {
                    expect(checker.checkString('foo([])')).to.have.no.errors();
                });

                it('should not report if there is two object arguments', function() {
                    expect(checker.checkString('foo([], [])')).to.have.no.errors();
                });

                it('should not report if object as first argument', function() {
                    expect(checker.checkString('foo([], test )')).to.have.no.errors();
                    expect(checker.checkString('foo([], test)'))
            .to.have.one.error.from('ruleName');
                });

                it('should report for object as second argument', function() {
                    expect(checker.checkString('foo( test, [])')).to.have.no.errors();
                    expect(checker.checkString('foo(test, [])'))
            .to.have.one.error.from('ruleName');
                });

                it('should report entity that look like array case', function() {
                    expect(checker.checkString('foo( test[i] )')).to.have.no.errors();
                    expect(checker.checkString('foo( test[i])'))
                        .to.have.one.error.from('ruleName');
                });
            });

            describe.skip('cycles:"for", "for..of", "while", "do..while"', function() {
                it('should report spacing problem for "for"', function() {
                    expect(checker.checkString('for(var i = 0; i < l; i++) {}')).to.have.validation.error.count.which.equals(2);
                    expect(checker.checkString('for( var i = 0; i < l; i++ ) {}')).to.have.no.errors();
                });

                it('should report spacing problem for "for..of"', function() {
                    expect(checker.checkString('for(var i in a) {};')).to.have.validation.error.count.which.equals(2);
                    expect(checker.checkString('for( var i in a ) {}')).to.have.no.errors();
                });

                it('should report spacing problem for "while"', function() {
                    expect(checker.checkString('while(condition) {}')).to.have.validation.error.count.which.equals(2);
                    expect(checker.checkString('while( condition ) {}')).to.have.no.errors();
                });

                it('should report spacing problem for "do..while"', function() {
                    expect(checker.checkString('do{} while(condition);')).to.have.validation.error.count.which.equals(2);
                    expect(checker.checkString('do{} while( condition );')).to.have.no.errors();
                });
            });
        });

        describe.skip('bool', function() {
            it('should not configure', function() {
                expect(function() {
                    checker.configure({ requireSpacesInsideParentheses: true });
                }).to.throw('AssertionError');
            });
        });
    });
});
