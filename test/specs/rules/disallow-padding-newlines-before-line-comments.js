var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-before-line-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesBeforeLineComments: true });
    });

    it('should report line comment after block comment with padding', function() {
        assert(checker.checkString('var a = 2;\n/* comment */\n\n// comment').getErrorCount() === 1);
    });

    it('should report padding before line comment', function() {
        assert(checker.checkString('var a = 2;\n\n// comment').getErrorCount() === 1);
    });

    it('should report additional padding before line comment', function() {
        assert(checker.checkString('var a = 2;\n\n\n// comment').getErrorCount() === 1);
    });

    it('should not report missing padding before line comment', function() {
        assert(checker.checkString('var a = 2;\n// comment').isEmpty());
    });

    it('should not report line comment after block comment', function() {
        assert(checker.checkString('var a = 2;\n/* comment */\n// comment').isEmpty());
    });

    it('should not report missing padding if comment is first line', function() {
        assert(checker.checkString('// comment\nvar a = 2;').isEmpty());
    });

    it('should not report missing padding with block comment', function() {
        assert(checker.checkString('var a = 2;\n/* comment */').isEmpty());
    });

    it('should not report missing padding after shebang', function() {
        assert(checker.checkString('#!/usr/bin/env node\n// comment').isEmpty());
    });
});
