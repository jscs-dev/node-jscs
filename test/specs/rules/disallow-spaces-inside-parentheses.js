var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-spaces-inside-parentheses', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw when given an number', function() {
            expect(function() {
                checker.configure({ disallowSpacesInsideParentheses: 2 });
            }).to.throw();
        });

        it('should throw when only is not specified in an object', function() {
            expect(function() {
                checker.configure({ disallowSpacesInsideParentheses: {} });
            }).to.throw();
        });

        it('should throw when all is specified but not true', function() {
            expect(function() {
                checker.configure({ disallowSpacesInsideParentheses: { all: ['invalid'] } });
            }).to.throw();
        });
    });

    describe('true', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideParentheses: true });
        });

        it('should report illegal space after opening round bracket', function() {
            expect(checker.checkString('( 1 + 2) * 3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('if ( 1 + 2)\n    3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('function my( a, b) {  }'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
        });

        it('should report illegal space before closing round bracket', function() {
            expect(checker.checkString('(1 + 2 ) * 3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('if (1 + 2 )\n    3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('function my(a, b ) {  }'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
        });

        it('should report illegal space in both cases', function() {
            expect(checker.checkString('( 1 + 2 ) * 3')).to.have.error.count.equal(2);
            expect(checker.checkString('if ( 1 + 2 )\n    3')).to.have.error.count.equal(2);
            expect(checker.checkString('function my( a, b ) {  }')).to.have.error.count.equal(2);
        });

        it('should report only one error after one error', function() {
            expect(checker.checkString('function my( ) {  }')).to.have.error.count.equal(1);
        });

        it('should not report with no spaces', function() {
            expect(checker.checkString('(1 + 2) * 3')).to.have.no.errors();
            expect(checker.checkString('if (1 + 2)\n    3')).to.have.no.errors();
            expect(checker.checkString('function my() {  }')).to.have.no.errors();
            expect(checker.checkString('function my(a, b) {  }')).to.have.no.errors();
        });

        it('should not report with closing round bracket on new line', function() {
            expect(checker.checkString('    myFunc(\n        withLongArguments\n    )')).to.have.no.errors();
        });

        it('should not report when a comment is present', function() {
            expect(checker.checkString('function x(el/* comment */, i/* comment */) {  }')).to.have.no.errors();
            expect(checker.checkString('function x(el /* comment */, i /* comment */) {  }')).to.have.no.errors();
        });
    });

    describe('"all" option', function() {
        beforeEach(function() {
            checker.configure({ disallowSpacesInsideParentheses: { all: true } });
        });

        it('should report illegal space after opening round bracket', function() {
            expect(checker.checkString('( 1 + 2) * 3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('if ( 1 + 2)\n    3'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            expect(checker.checkString('function my( a, b) {  }'))
              .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
        });
    });

    describe('es6', function() {
        beforeEach(function() {
            checker.configure({
                disallowSpacesInsideParentheses: true
            });
        });

        it('should not report with no spaces around a regex', function() {
            expect(checker.checkString('expect(a).toMatch(/home/);')).to.have.no.errors();
        });

        it('should not report with no spaces in an export default statement', function() {
            expect(checker.checkString('export default function() {}')).to.have.no.errors();
        });

        it('should not report with no spaces in an interpolated template string', function() {
            expect(checker.checkString('throw new Error(`foo ${"bar"}`);')).to.have.no.errors();
        });
    });

    describe('"only" option', function() {
        describe('quotes', function() {
            it('should handle double quotes', function() {
                checker.configure({
                    disallowSpacesInsideParentheses: {
                        only: ['"']
                    }
                });

                expect(checker.checkString('foo( "bar" )')).to.have.error.count.equal(2);
                expect(checker.checkString('( "1 + 2 ") * 3'))
                  .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                expect(checker.checkString('if ( "1 + 2 ")\n    3'))
                  .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            });

            it('should handle single quotes', function() {
                checker.configure({
                    disallowSpacesInsideParentheses: {
                        only: ['\'']
                    }
                });
                expect(checker.checkString('foo( \'bar\' )')).to.have.error.count.equal(2);
                expect(checker.checkString('( \'1 + 2 \') * 3'))
                  .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                expect(checker.checkString('if ( \'1 + 2 \')\n    3'))
                  .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
            });

            it('should report single but not double quotes', function() {
                checker.configure({
                    disallowSpacesInsideParentheses: {
                        only: ['\'']
                    }
                });
                expect(checker.checkString('foo( "bar" );foo( \'bar\' )')).to.have.error.count.equal(2);
            });
        });

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
                    expect(checker.checkString('foo(function() {})')).to.have.no.errors();
                    expect(checker.checkString('foo( function() {} )')).to.have.error.count.equal(2);
                });

                it('should report for funarg as first argument', function() {
                    expect(checker.checkString('foo(function() {}, test)')).to.have.no.errors();
                    expect(checker.checkString('foo( function() {}, test)'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( function() {}, test )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });

                it('should report for funarg as second argument', function() {
                    expect(checker.checkString('foo(test, function() {})')).to.have.no.errors();
                    expect(checker.checkString('foo(test, function() {} )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( test, function() {} )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });
            });

            describe('{}', function() {
                it('should report if object is the sole argument', function() {
                    expect(checker.checkString('foo({})')).to.have.no.errors();
                    expect(checker.checkString('foo( {} )')).to.have.error.count.equal(2);
                });

                it('should report for if object is first argument', function() {
                    expect(checker.checkString('foo( test, {})')).to.have.no.errors();
                    expect(checker.checkString('foo(test, {} )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( test, {} )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });

                it('should report for if object is second argument', function() {
                    expect(checker.checkString('foo({}, test)')).to.have.no.errors();
                    expect(checker.checkString('foo( {}, test)'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( {}, test )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });
                it('should report if there two object arguments', function() {
                    expect(checker.checkString('foo({}, {})')).to.have.no.errors();
                    expect(checker.checkString('foo( {}, {})'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( {}, {} )')).to.have.error.count.equal(2);
                });
            });

            describe('[]', function() {
                it('should report if array is the sole argument', function() {
                    expect(checker.checkString('foo([])')).to.have.no.errors();
                    expect(checker.checkString('foo( [] )')).to.have.error.count.equal(2);
                });

                it('should report for if array is first argument', function() {
                    expect(checker.checkString('foo( test, [])')).to.have.no.errors();
                    expect(checker.checkString('foo(test, [] )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( test, [] )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });

                it('should report for if array is second argument', function() {
                    expect(checker.checkString('foo([], test)')).to.have.no.errors();
                    expect(checker.checkString('foo( [], test)'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( [], test )'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                });
                it('should report if there two array arguments', function() {
                    expect(checker.checkString('foo([], [])')).to.have.no.errors();
                    expect(checker.checkString('foo( [], [])'))
                      .to.have.one.validation.error.from('disallowSpacesInsideParentheses');
                    expect(checker.checkString('foo( [], [] )')).to.have.error.count.equal(2);
                });

                it('should report entity that look like array case', function() {
                    expect(checker.checkString('foo(test[i] )')).to.have.no.errors();
                });
            });
        });
    });
});
