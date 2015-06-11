var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/disallow-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowPaddingNewLinesAfterBlocks: true });
    });

    it('should report padding after block', function() {
        assert(checker.checkString('if(true){}\n\nvar a = 2;').getErrorCount() === 1);
    });

    it('should report padding after nested block', function() {
        assert(checker.checkString('if(true){\nif(true) {}\n\nvar a = 2;}').getErrorCount() === 1);
    });

    it('should report padding after obj func definition', function() {
        assert(checker.checkString('var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}').getErrorCount() === 1);
    });

    it('should report padding after immed func', function() {
        assert(checker.checkString('(function(){\n})()\n\nvar a = 2;').getErrorCount() === 1);
    });

    it('should not report end of file', function() {
        assert(checker.checkString('if(true){}').isEmpty());
    });

    it('should not report end of file with extra line', function() {
        assert(checker.checkString('if(true){}\n').isEmpty());
    });

    it('should not report missing padding after block', function() {
        assert(checker.checkString('if(true){}\nvar a = 2;').isEmpty());
    });

    it('should not report missing padding after nested block', function() {
        assert(checker.checkString('if(true){\nif(true) {}\n}').isEmpty());
    });

    it('should not report missing padding after obj func definition', function() {
        assert(checker.checkString('var a = {\nfoo: function() {\n},\nbar: function() {\n}}').isEmpty());
    });

    it('should not report missing padding after immed func', function() {
        assert(checker.checkString('(function(){\n})()\nvar a = 2;').isEmpty());
    });

    it('should not report missing padding in if else', function() {
        assert(checker.checkString('if(true) {\n}\nelse\n{\n}').isEmpty());
    });

    it('should not report content in missing padding if else', function() {
        assert(checker.checkString('if(true) {\n} else {\n var a = 2; }').isEmpty());
    });

    it('should not report missing padding in if elseif else', function() {
        assert(checker.checkString('if(true) {\n}\nelse if(true)\n{\n}\nelse {\n}').isEmpty());
    });

    it('should not report missing padding in do while', function() {
        assert(checker.checkString('do{\n}\nwhile(true)').isEmpty());
    });

    it('should not report missing padding in try catch', function() {
        assert(checker.checkString('try{\n}\ncatch(e) {}').isEmpty());
    });

    it('should not report missing padding in try finally', function() {
        assert(checker.checkString('try{\n}\nfinally {}').isEmpty());
    });

    it('should not report missing padding in try catch finally', function() {
        assert(checker.checkString('try{\n}\ncatch(e) {\n}\nfinally {\n}').isEmpty());
    });

    it('should not report missing padding in function chain', function() {
        assert(checker.checkString('[].map(function() {})\n.filter(function(){})').isEmpty());
    });

    reportAndFix({
        name: 'should fix padding after function with semicolon',
        rules: { disallowPaddingNewLinesAfterBlocks: true },
        input: 'var a = function() {};\n\nvar b = 2;',
        output: 'var a = function() {};\nvar b = 2;',
        errors: 1
    });
});
