var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-template-strings', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    function errorChecks(string) {
        it('should report the use of string concatenation with a identifier on the left', function() {
            assert(checker.checkString('a + ' + string).getErrorCount() === 1);
        });

        it('should report the use of string concatenation with a identifier on the right', function() {
            assert(checker.checkString(string + ' + a').getErrorCount() === 1);
        });

        it('should report the use of string concatenation with right handed binary expression',
            function() {
                assert(checker.checkString('"test" + (a + b)').getErrorCount() === 1);
            }
        );

        it('should report the use of string concatenation with left handed binary expression',
            function() {
                assert(checker.checkString('(a + b) + "test"').getErrorCount() === 1);
            }
        );

        it('should report for the use of string concatenation with a CallExpression',
            function() {
                assert(checker.checkString('a() + ' + string).getErrorCount() === 1);
                assert(checker.checkString(string + ' + a()').getErrorCount() === 1);
            }
        );

        it('should report for the use of string concatenation with a MemberExpression',
            function() {
                assert(checker.checkString('a.b + ' + string).getErrorCount() === 1);
                assert(checker.checkString(string + ' + a.b').getErrorCount() === 1);
            }
        );

        it('should report for the use of string concatenation with a TaggedTemplateExpression',
            function() {
                assert(checker.checkString('a`a` + ' + string).getErrorCount() === 1);
                assert(checker.checkString(string + ' + a`a`').getErrorCount() === 1);
            }
        );
    }

    function validChecks() {
        it('should not report the use of string concatenation with a identifier on the left and right', function() {
            assert(checker.checkString('a + a').isEmpty());
        });

        it('should not report the use of template strings', function() {
            assert(checker.checkString('`How are you, ${name}?`').isEmpty());
        });

        it('should not report for number literals', function() {
            assert(checker.checkString('1 + a').isEmpty());
            assert(checker.checkString('a + 1').isEmpty());
        });

        it('should not report for null literal', function() {
            assert(checker.checkString('null + a').isEmpty());
            assert(checker.checkString('a + null').isEmpty());
        });

        it('should not report for true literal', function() {
            assert(checker.checkString('true + a').isEmpty());
            assert(checker.checkString('a + false').isEmpty());
        });

        it('should not report for binary expression that isn\'t +', function() {
            assert(checker.checkString('1 * 2').isEmpty());
            assert(checker.checkString('a === b').isEmpty());
        });
    }

    describe('true value', function() {
        beforeEach(function() {
            checker.configure({
                esnext: true,
                requireTemplateStrings: true
            });
        });

        describe('for a string', function() {
            errorChecks('"string"');

            it('should report for the use of string concatenation with a TemplateLiteral',
                function() {
                    assert(checker.checkString('`a` + "string"').getErrorCount() === 1);
                    assert(checker.checkString('"string" + `a`').getErrorCount() === 1);
                }
            );
        });

        describe('for a template string', function() {
            errorChecks('`templateString`');
        });

        validChecks();

        it('should report the use of string concatenation with two string literals', function() {
            assert(checker.checkString('"a" + "a"').getErrorCount() === 1);
        });

        it('should report the use of string concatenation with two template strings', function() {
            assert(checker.checkString('`a` + `a`').getErrorCount() === 1);
        });
    });

    describe('allExcept: ["stringConcatenation"] value', function() {
        beforeEach(function() {
            checker.configure({
                esnext: true,
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
            assert(checker.checkString('"a" + "a"').isEmpty());
        });

        it('should not report the use of string concatenation with two template strings', function() {
            assert(checker.checkString('`a` + `a`').isEmpty());
        });
    });

    describe('invalid options', function() {
        it('should throw if not allExcept object', function() {
            assert.throws(function() {
                checker.configure({requireTemplateStrings: {allBut: false}});
            });
        });

        it('should throw if unknown allExcept value', function() {
            assert.throws(function() {
                checker.configure({requireTemplateStrings: {allExcept: ['badOptionName']}});
            });
        });
    });
});
