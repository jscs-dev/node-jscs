var Checker = require('../../../lib/checker');
var expect = require('chai').expect;

describe.skip('rules/require-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe.skip('invalid options', function() {
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

    describe.skip('value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewLinesAfterBlocks: true });
        });

        it('should report missing padding after block', function() {
            expect(checker.checkString('if(true){}\nvar a = 2;'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing padding after nested block', function() {
            expect(checker.checkString('if(true){\nif(true) {}\nvar a = 2;}'))
            .to.have.one.error.from('ruleName');
        });

        it('should report missing padding after obj func definition', function() {
            assert(checker.checkString(
                'var a = {\nfoo: function() {\n},\nbar: function() {\n}}'
            ).getValidationErrorCount() === 1);
        });

        it('should report missing padding after immed func', function() {
            expect(checker.checkString('(function(){\n})()\nvar a = 2;'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report end of file', function() {
            expect(checker.checkString('if(true){}')).to.have.no.errors();
        });

        it('should not report end of file with empty line', function() {
            expect(checker.checkString('if(true){}\n')).to.have.no.errors();
        });

        it('should not report padding after block', function() {
            expect(checker.checkString('if(true){}\n\nvar a = 2;')).to.have.no.errors();
        });

        it('should not report additional padding after block', function() {
            expect(checker.checkString('if(true){}\n\n\nvar a = 2;')).to.have.no.errors();
        });

        it('should not report padding after nested block', function() {
            expect(checker.checkString('if(true){\nif(true) {}\n}')).to.have.no.errors();
        });

        it('should not report padding after obj func definition', function() {
            expect(checker.checkString('var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}')).to.have.no.errors();
        });

        it('should not report padding after immed func', function() {
            expect(checker.checkString('(function(){\n})()\n\nvar a = 2;')).to.have.no.errors();
        });

        it('should not report missing padding in if else', function() {
            expect(checker.checkString('if(true) {\n}\nelse\n{\n}')).to.have.no.errors();
        });

        it('should not report content in missing padding if else', function() {
            expect(checker.checkString('if(true) {\n} else {\n var a = 2; }')).to.have.no.errors();
        });

        it('should not report missing padding in if elseif else', function() {
            expect(checker.checkString('if(true) {\n}\nelse if(true)\n{\n}\nelse {\n}')).to.have.no.errors();
        });

        it('should not report missing padding in do while', function() {
            expect(checker.checkString('do{\n}\nwhile(true)')).to.have.no.errors();
        });

        it('should not report missing padding in try catch', function() {
            expect(checker.checkString('try{\n}\ncatch(e) {}')).to.have.no.errors();
        });

        it('should not report missing padding in try finally', function() {
            expect(checker.checkString('try{\n}\nfinally {}')).to.have.no.errors();
        });

        it('should not report missing padding in try catch finally', function() {
            expect(checker.checkString('try{\n}\ncatch(e) {\n}\nfinally {\n}')).to.have.no.errors();
        });

        it('should not report missing padding in function chain', function() {
            expect(checker.checkString('[].map(function() {})\n.filter(function(){})')).to.have.no.errors();
        });

        it('should report missing padding when function is last arguments', function() {
            expect(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report missing padding when function is last in array', function() {
            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]'))
            .to.have.one.error.from('ruleName');
        });

        it('should not report missing padding when function is middle in array', function() {
            expect(checker.checkString('[\n3,\nfunction() {\n},\n2\n]'))
            .to.have.one.error.from('ruleName');
        });
    });

    describe.skip('value allExcept: inCallExpressions', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inCallExpressions']
                }
            });
        });

        it('should not report missing padding when function is last arguments', function() {
            expect(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle argument', function() {
            expect(checker.checkString('func(\n3,\nfunction() {\n},\n2\n)')).to.have.no.errors();
        });
    });

    describe.skip('value allExcept: inArrayExpressions', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inArrayExpressions']
                }
            });
        });

        it('should not report missing padding when function is last in array', function() {
            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle in array', function() {
            expect(checker.checkString('[\n3,\nfunction() {\n},\n2\n]')).to.have.no.errors();
        });
    });

    describe.skip('value allExcept: inProperties', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inProperties']
                }
            });
        });

        it('should not report missing padding when function is last in object', function() {
            expect(checker.checkString('var a = {\na: 2,\nb: 3,\nc: function() {\n}\n};')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle in object', function() {
            expect(checker.checkString('var a = {\na: 3,\nb: function() {\n},\nc: 2\n}')).to.have.no.errors();
        });
    });

    describe.skip('changing value', function() {
        it('should change value (#1343)', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ requirePaddingNewLinesAfterBlocks: true });

            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]'))
            .to.have.one.error.from('ruleName');

            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inArrayExpressions']
                }
            });

            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]')).to.have.no.errors();
        });
    });
});
