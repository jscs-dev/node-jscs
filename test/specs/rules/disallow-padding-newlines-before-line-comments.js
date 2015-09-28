var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe('rules/disallow-padding-newlines-before-line-comments', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesBeforeLineComments: true });
    });

    it('should report line comment after block comment with padding', function() {
        expect(checker.checkString('var a = 2;\n/* comment */\n\n// comment'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesBeforeLineComments');
    });

    it('should report padding before line comment', function() {
        expect(checker.checkString('var a = 2;\n\n// comment'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesBeforeLineComments');
    });

    it('should report additional padding before line comment', function() {
        expect(checker.checkString('var a = 2;\n\n\n// comment'))
          .to.have.one.validation.error.from('disallowPaddingNewLinesBeforeLineComments');
    });

    it('should not report missing padding before line comment', function() {
        expect(checker.checkString('var a = 2;\n// comment')).to.have.no.errors();
    });

    it('should not report line comment after block comment', function() {
        expect(checker.checkString('var a = 2;\n/* comment */\n// comment')).to.have.no.errors();
    });

    it('should not report missing padding if comment is first line', function() {
        expect(checker.checkString('// comment\nvar a = 2;')).to.have.no.errors();
    });

    it('should not report missing padding with block comment', function() {
        expect(checker.checkString('var a = 2;\n/* comment */')).to.have.no.errors();
    });

    it('should not report missing padding after shebang', function() {
        expect(checker.checkString('#!/usr/bin/env node\n// comment')).to.have.no.errors();
    });
});
