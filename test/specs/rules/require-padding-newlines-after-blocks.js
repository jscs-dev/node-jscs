var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('invalid options', function() {
        it('should throw if false', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: false });
            });
        });

        it('should throw if empty object', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: {} });
            });
        });

        it('should throw if not allExcept object', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allBut: false} });
            });
        });

        it('should throw if array', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: [] });
            });
        });

        it('should throw if allExcept empty array', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allExcept: [] } });
            });
        });

        it('should throw if not allExcept unrecognized', function() {
            assert.throws(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allExcept: ['foo']} });
            });
        });
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewLinesAfterBlocks: true });
        });

        it('should report missing padding after block', function() {
            assert(checker.checkString('if(true){}\nvar a = 2;').getErrorCount() === 1);
        });

        it('should report missing padding after nested block', function() {
            assert(checker.checkString('if(true){\nif(true) {}\nvar a = 2;}').getErrorCount() === 1);
        });

        it('should report missing padding after obj func definition', function() {
            assert(checker.checkString(
                'var a = {\nfoo: function() {\n},\nbar: function() {\n}}'
            ).getErrorCount() === 1);
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

        it('should report missing padding when function is last arguments', function() {
            assert(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)').getErrorCount() === 1);
        });

        it('should not report missing padding when function is last in array', function() {
            assert(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]').getErrorCount() === 1);
        });

        it('should not report missing padding when function is middle in array', function() {
            assert(checker.checkString('[\n3,\nfunction() {\n},\n2\n]').getErrorCount() === 1);
        });
    });

    describe('value allExcept: inCallExpressions', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inCallExpressions']
                }
            });
        });

        it('should not report missing padding when function is last arguments', function() {
            assert(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)').isEmpty());
        });

        it('should not report missing padding when function is middle argument', function() {
            assert(checker.checkString('func(\n3,\nfunction() {\n},\n2\n)').isEmpty());
        });
    });

    describe('value allExcept: inArrayExpressions', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inArrayExpressions']
                }
            });
        });

        it('should not report missing padding when function is last in array', function() {
            assert(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]').isEmpty());
        });

        it('should not report missing padding when function is middle in array', function() {
            assert(checker.checkString('[\n3,\nfunction() {\n},\n2\n]').isEmpty());
        });
    });

    describe('value allExcept: inProperties', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inProperties']
                }
            });
        });

        it('should not report missing padding when function is last in object', function() {
            assert(checker.checkString('var a = {\na: 2,\nb: 3,\nc: function() {\n}\n};').isEmpty());
        });

        it('should not report missing padding when function is middle in object', function() {
            assert(checker.checkString('var a = {\na: 3,\nb: function() {\n},\nc: 2\n}').isEmpty());
        });
    });
});
