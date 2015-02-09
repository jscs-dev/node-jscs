var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-before-line-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLinesBeforeLineComments: true });
    });

    it('should report missing padding before line comment', function() {
        assert(checker.checkString('var a = 2;\n// comment').getErrorCount() === 1);
    });

    it('should report line comment after block comment', function() {
        assert(checker.checkString('var a = 2;\n/* comment */\n// comment').getErrorCount() === 1);
    });

    it('should not report missing padding if comment is first line', function() {
        assert(checker.checkString('// comment\nvar a = 2;').isEmpty());
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
});
