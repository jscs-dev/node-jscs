var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-before-line-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw if false', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesBeforeLineComments: false });
            });
        });

        it('should throw if array', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesBeforeLineComments: [] });
            });
        });

        it('should throw if empty object', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesBeforeLineComments: {} });
            });
        });

        it('should throw if not allExcept object', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesBeforeLineComments: { allBut: false} });
            });
        });

        it('should throw if not allExcept firstAfterCurly', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesBeforeLineComments: { allExcept: 'badOptionName'} });
            });
        });
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewLinesBeforeLineComments: true });
        });

        it('should report missing padding before line comment', function() {
            assert(checker.checkString('var a = 2;\n// comment').getErrorCount() === 1);
        });

        it('should report line comment after block comment', function() {
            assert(checker.checkString('var a = 2;\n/* comment */\n// comment').getErrorCount() === 1);
        });

        it('should not report multiple line comments', function() {
            assert(checker.checkString('// comment\n//foo').isEmpty());
        });

        it('should report one error if multiple comments dont have line space', function() {
            assert(checker.checkString('var a = 2;\n// comment\n// comment').getErrorCount() === 1);
        });

        it('should not report missing padding if comment is first line', function() {
            assert(checker.checkString('// comment\nvar a = 2;').isEmpty());
        });

        it('should not report missing padding if newline is 1st line and the comment is 2nd line #1527', function() {
            assert(checker.checkString('\n// comment\nvar a = 2;').isEmpty());
        });

        it('should not report padding before line comment', function() {
            assert(checker.checkString('var a = 2;\n\n// comment').isEmpty());
        });

        it('should not report additional padding before line comment', function() {
            assert(checker.checkString('var a = 2;\n\n\n// comment').isEmpty());
        });

        it('should not report missing padding with block comment', function() {
            assert(checker.checkString('var a = 2;\n/* comment */').isEmpty());
        });

        it('should not report line comment after block comment with padding', function() {
            assert(checker.checkString('var a = 2;\n/* comment */\n\n// comment').isEmpty());
        });

        it('should report error if first line after a curly', function() {
            assert(checker.checkString('if (true) {\n// comment\n}').getErrorCount() === 1);
        });

        it('should not consider code and comment on the same line (#1194)', function() {
            assert(checker.checkString('var a; \n var b; //comment\n').isEmpty());
            assert(checker.checkString('var a; \n var b; //comment\nvar c;').isEmpty());
            assert(checker.checkString('/**/var a; \n var b// comment\n').isEmpty());
        });
    });

    describe('value allExcept: firstAfterCurly', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesBeforeLineComments: {
                    allExcept: 'firstAfterCurly'
                }
            });
        });

        it('should not report error if first line after a curly', function() {
            assert(checker.checkString('if (true) {\n// comment\n}').isEmpty());
            assert(checker.checkString('var a = {\n// comment\n};').isEmpty());
        });
    });
});
