var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requirePaddingNewLinesAfterBlocks: true });
    });

    it('should report missing padding after block', function() {
        assert(checker.checkString('if(true){}\nvar a = 2;').getErrorCount() === 1);
    });

    it('should report missing padding after nested block', function() {
        assert(checker.checkString('if(true){\nif(true) {}\nvar a = 2;}').getErrorCount() === 1);
    });

    it('should report missing padding after immed func', function() {
        assert(checker.checkString('(function(){\n})()\nvar a = 2;').getErrorCount() === 1);
    });

    it('should not report end of file', function() {
        assert(checker.checkString('if(true){}').isEmpty());
    });

    it('should not report end of file with empty line', function() {
        assert(checker.checkString('if(true){}\n').isEmpty());
    });

    it('should not report padding after block', function() {
        assert(checker.checkString('if(true){}\n\nvar a = 2;').isEmpty());
    });

    it('should not report additional padding after block', function() {
        assert(checker.checkString('if(true){}\n\n\nvar a = 2;').isEmpty());
    });

    it('should not report padding after nested block', function() {
        assert(checker.checkString('if(true){\nif(true) {}\n}').isEmpty());
    });

    it('should not report padding after obj func definition', function() {
        assert(checker.checkString('var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}').isEmpty());
    });

    it('should not report padding after immed func', function() {
        assert(checker.checkString('(function(){\n})()\n\nvar a = 2;').isEmpty());
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

    it('should not be so strict in function calls (#1232)', function() {
        assert(checker.checkString('callingAFunction("with", "another", function() {}\n)').isEmpty());
        assert(checker.checkString('foo(\narr.map(function() {\n})\n);').isEmpty());
    });

    it('should not be so strict in function calls if it is not the last argument (#1232)', function() {
        assert(checker.checkString('callingAFunction("with",function() {},\n"another")').isEmpty());
    });

    it('should not report missing padding when function is last in array', function() {
        assert(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]').isEmpty());
    });

    it('should not report missing padding when function is middle in array', function() {
        assert(checker.checkString('[\n3,\nfunction() {\n},\n2\n]').isEmpty());
    });

    it('should not report missing padding when function is last in object', function() {
        assert(checker.checkString('({ a: 1,\n b: 2,\n c: function() {\n}\n})').isEmpty());
    });

    it('should not report missing padding when function is middle in object', function() {
        assert(checker.checkString('({ a: 1, b: function() {\n},\n c: 3 \n})').isEmpty());
    });
});
