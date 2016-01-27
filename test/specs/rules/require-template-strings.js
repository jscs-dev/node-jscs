var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/require-template-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    function errorChecks(string) {
        it('should report the use of string concatenation with a identifier on the left', function() {
            expect(checker.checkString('a + ' + string)).to.have.one.validation.error.from('requireTemplateStrings');
        });

        it('should report the use of string concatenation with a identifier on the right', function() {
            expect(checker.checkString(string + ' + a')).to.have.one.validation.error.from('requireTemplateStrings');
        });

        it('should report the use of string concatenation with right handed binary expression',
            function() {
                expect(checker.checkString('"test" + (a + b)'))
                  .to.have.one.validation.error.from('requireTemplateStrings');
            }
        );

        it('should report the use of string concatenation with left handed binary expression',
            function() {
                expect(checker.checkString('(a + b) + "test"'))
                  .to.have.one.validation.error.from('requireTemplateStrings');
            }
        );

        it('should report for the use of string concatenation with a CallExpression',
            function() {
                expect(checker.checkString('a() + ' + string))
                  .to.have.one.validation.error.from('requireTemplateStrings');
                expect(checker.checkString(string + ' + a()'))
                  .to.have.one.validation.error.from('requireTemplateStrings');
            }
        );

        it('should report for the use of string concatenation with a MemberExpression',
            function() {
                expect(checker.checkString('a.b + ' + string))
                  .to.have.one.validation.error.from('requireTemplateStrings');
                expect(checker.checkString(string + ' + a.b'))
                  .to.have.one.validation.error.from('requireTemplateStrings');
            }
        );

        it('should report for the use of string concatenation with a TaggedTemplateExpression',
            function() {
                expect(checker.checkString('a`a` + ' + string))
                  .to.have.one.validation.error.from('requireTemplateStrings');
                expect(checker.checkString(string + ' + a`a`'))
                  .to.have.one.validation.error.from('requireTemplateStrings');
            }
        );
    }

    function validChecks() {
        it('should not report the use of string concatenation with a identifier on the left and right', function() {
            expect(checker.checkString('a + a')).to.have.no.errors();
        });

        it('should not report the use of template strings', function() {
            expect(checker.checkString('`How are you, ${name}?`')).to.have.no.errors();
        });

        it('should not report for number literals', function() {
            expect(checker.checkString('1 + a')).to.have.no.errors();
            expect(checker.checkString('a + 1')).to.have.no.errors();
        });

        it('should not report for null literal', function() {
            expect(checker.checkString('null + a')).to.have.no.errors();
            expect(checker.checkString('a + null')).to.have.no.errors();
        });

        it('should not report for true literal', function() {
            expect(checker.checkString('true + a')).to.have.no.errors();
            expect(checker.checkString('a + false')).to.have.no.errors();
        });

        it('should not report for binary expression that isn\'t +', function() {
            expect(checker.checkString('1 * 2')).to.have.no.errors();
            expect(checker.checkString('a === b')).to.have.no.errors();
        });
    }

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({
                requireTemplateStrings: true
            });
        });

        describe('for a string', function() {
            errorChecks('"string"');

            it('should report for the use of string concatenation with a TemplateLiteral',
                function() {
                    expect(checker.checkString('`a` + "string"'))
                      .to.have.one.validation.error.from('requireTemplateStrings');
                    expect(checker.checkString('"string" + `a`'))
                      .to.have.one.validation.error.from('requireTemplateStrings');
                }
            );
        });

        describe('for a template string', function() {
            errorChecks('`templateString`');
        });

        validChecks();

        it('should report the use of string concatenation with two string literals', function() {
            expect(checker.checkString('"a" + "a"')).to.have.one.validation.error.from('requireTemplateStrings');
        });

        it('should report the use of string concatenation with two template strings', function() {
            expect(checker.checkString('`a` + `a`')).to.have.one.validation.error.from('requireTemplateStrings');
        });
    });

    describe('allExcept: ["stringConcatenation"] value', function() {
        beforeEach(function() {
            checker.configure({
                requireTemplateStrings: {
                    allExcept: ['stringConcatenation']
                }
            });
        });

        describe('for a string', function() {
            errorChecks('"string"');
        });

        describe('for a template string', function() {
            errorChecks('`templateString`');
        });

        validChecks();

        it('should not report the use of string concatenation with two string literals', function() {
            expect(checker.checkString('"a" + "a"')).to.have.no.errors();
        });

        it('should not report the use of string concatenation with two template strings', function() {
            expect(checker.checkString('`a` + `a`')).to.have.no.errors();
        });

        it('should not report string with binary concatination', function() {
            expect(checker.checkString('"a" + "b" + "c";')).to.have.no.errors();
        });

        it('should not report string with binary concatination for three operands', function() {
            expect(checker.checkString('"a" + "b" + "c";')).to.have.no.errors();
        });

        it('should not report string with binary concatination for four operands', function() {
            expect(checker.checkString('"a" + "b" + "c" + "d";')).to.have.no.errors();
        });
    });

    describe('invalid options', function() {
        it('should throw if not allExcept object', function() {
            expect(function() {
                checker.configure({requireTemplateStrings: {allBut: false}});
            }).to.throw();
        });

        it('should throw if unknown allExcept value', function() {
            expect(function() {
                checker.configure({requireTemplateStrings: {allExcept: ['badOptionName']}});
            }).to.throw();
        });
    });
});
