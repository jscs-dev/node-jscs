var expect = require('chai').expect;
var Checker = require('../../../lib/checker');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-padding-newlines-after-blocks', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    it('should not throw exceptions with blocks', function() {
        checker.configure({ requirePaddingNewLinesAfterBlocks: true });
        expect(checker.checkString('{}')).to.have.no.errors();
    });

    describe('invalid options', function() {
        it('should throw if empty object', function() {
            expect(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: {} });
            }).to.throw();
        });

        it('should throw if not allExcept object', function() {
            expect(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allBut: false} });
            }).to.throw();
        });

        it('should throw if array', function() {
            expect(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: [] });
            }).to.throw();
        });

        it('should throw if allExcept empty array', function() {
            expect(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allExcept: [] } });
            }).to.throw();
        });

        it('should throw if not allExcept unrecognized', function() {
            expect(function() {
                checker.configure({ requirePaddingNewLinesAfterBlocks: { allExcept: ['foo']} });
            }).to.throw();
        });
    });

    describe('value true', function() {
        var rules = { requirePaddingNewLinesAfterBlocks: true };
        beforeEach(function() {
            checker.configure(rules);
        });

        reportAndFix({
            name: 'missing padding after block',
            rules: rules,
            input: 'if(true){}\nvar a = 2;',
            output: 'if(true){}\n\nvar a = 2;'
        });

        reportAndFix({
            name: 'after function definitions',
            rules: rules,
            input: 'var a = function() {\n};\nvar b = 2;',
            output: 'var a = function() {\n};\n\nvar b = 2;'
        });

        reportAndFix({
            name: 'missing padding after nested block',
            rules: rules,
            input: 'if(true){\nif(true) {}\nvar a = 2;}',
            output: 'if(true){\nif(true) {}\n\nvar a = 2;}'
        });

        reportAndFix({
            name: 'missing padding after obj func definition',
            rules: rules,
            input: 'var a = {\nfoo: function() {\n},\nbar: function() {\n}}',
            output: 'var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}'
        });

        reportAndFix({
            name: 'missing padding after immed func',
            rules: rules,
            input: '(function(){\n})()\nvar a = 2;',
            output: '(function(){\n})()\n\nvar a = 2;'
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
            expect(checker.checkString('var a = {\nfoo: function() {\n},\n\nbar: function() {\n}}'))
              .to.have.no.errors();
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

        it('should not report missing padding when function is last arguments', function() {
            expect(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)')).to.have.no.errors();
        });

        it('should not report missing padding when function is last in array', function() {
            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]')).to.have.no.errors();
        });

        it('should report missing padding when function is middle in array', function() {
            expect(checker.checkString('[\n3,\nfunction() {\n},\n2\n]'))
              .to.have.one.validation.error.from('requirePaddingNewLinesAfterBlocks');
        });

        it('should not report arrow chain (#1700)', function() {
            expect(checker.checkString('a(res => {\n})\n.b();')).to.have.no.errors();
        });

        it('should not report jsx tags (#2008)', function() {
            var jsxSnippet = 'var foo = (\n<div\nref={function() {\n}}\n>\nfoo\n</div>\n);';
            expect(checker.checkString(jsxSnippet)).to.have.no.errors();
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
            expect(checker.checkString('func(\n2,\n3,\nfunction() {\n}\n)')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle argument', function() {
            expect(checker.checkString('func(\n3,\nfunction() {\n},\n2\n)')).to.have.no.errors();
        });

        it('should not report for IIFE', function() {
            expect(checker.checkString('(function() {})\n(1,2,3)')).to.have.no.errors();
        });

        it('should not report missing padding when function is last in array', function() {
            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]')).to.have.no.errors();
        });

        it('should report missing padding when function is middle in array', function() {
            expect(checker.checkString('[\n3,\nfunction() {\n},\n2\n]'))
              .to.have.one.validation.error.from('requirePaddingNewLinesAfterBlocks');
        });
    });

    describe('value allExcept: inNewExpressions', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inNewExpressions']
                }
            });
        });

        it('should not report missing padding when function is last argument', function() {
            expect(checker.checkString('new Obj(\n2,\n3,\nfunction() {\n}\n)')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle argument', function() {
            expect(checker.checkString('new Obj(\n3,\nfunction() {\n},\n2\n)')).to.have.no.errors();
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
            expect(checker.checkString('[\n2,\n3,\nfunction() {\n}\n]')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle in array', function() {
            expect(checker.checkString('[\n3,\nfunction() {\n},\n2\n]')).to.have.no.errors();
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
            expect(checker.checkString('var a = {\na: 2,\nb: 3,\nc: function() {\n}\n};')).to.have.no.errors();
        });

        it('should not report missing padding when function is middle in object', function() {
            expect(checker.checkString('var a = {\na: 3,\nb: function() {\n},\nc: 2\n}')).to.have.no.errors();
        });
    });

    describe('value allExcept: singleLine', function() {
        beforeEach(function() {
            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['singleLine']
                }
            });
        });

        it('should not report missing padding when block is a single line', function() {
            var str = 'var i = 0;\nwhile (i < 100) {\nif(i % 2 === 0) {continue;}\n++i;\n}';
            expect(checker.checkString(str)).to.have.no.errors();
        });

        it('should not report missing padding when block is a single line that is nested', function() {
            var str = 'var i = 0;\nwhile (i < 100) {\nif(i % 2 === 0) {if(i === 4) {continue;}}\n++i;\n}';
            expect(checker.checkString(str)).to.have.no.errors();
        });
    });

    describe('changing value', function() {
        it('should change value (#1343)', function() {
            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({ requirePaddingNewLinesAfterBlocks: true });

            expect(checker.checkString('[\n2,\n3,\nfunction() {\n},\nfunction() {\n}\n]'))
              .to.have.one.validation.error.from('requirePaddingNewLinesAfterBlocks');

            checker.configure({
                requirePaddingNewLinesAfterBlocks: {
                    allExcept: ['inArrayExpressions']
                }
            });

            expect(checker.checkString('[\n2,\n3,\nfunction() {\n},\nfunction() {\n}\n]')).to.have.no.errors();
        });
    });
});
