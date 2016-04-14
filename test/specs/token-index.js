var JsFile = require('../../lib/js-file');
var TokenIndex = require('../../lib/token-index');
var assign = require('lodash').assign;
var expect = require('chai').expect;

function createJsFile(sources, options) {
    var params = {
        filename: 'example.js',
        source: sources
    };

    return new JsFile(assign(params, options));
}

function createPragmaIndex(file) {
    return new TokenIndex(file.getProgram().getFirstToken());
}

describe('TokenIndex', function() {
    describe('isRuleEnabled', function() {
        it('should always return true when no control comments are used', function() {
            var file = createJsFile(['var x = "1";', 'x++;', 'x--;'].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        it('should always return false when jscs is disabled', function() {
            var file = createJsFile(['// jscs: disable', 'var x = "1";', 'x++;', 'x--;'].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(false);
        });

        it('should return true when jscs is reenabled', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable',
                'x++;',
                'x--;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        it('should ignore other comments', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable',
                'x++;',
                '// hello world',
                'x--;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        it('should accept block comments', function() {
            var file = createJsFile([
                '/* jscs: disable */',
                'var x = "1";',
                '/* jscs: enable */',
                'x++;',
                'x--;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        it('should only enable the specified rule', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable validateQuoteMarks',
                'x++;',
                '// jscs: enable',
                'x--;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);
            expect(
                index.isRuleEnabled('newRule', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        it('should ignore leading and final comma', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable ,validateQuoteMarks,',
                'x++;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(true);

        });

        it('should only disable the specified rule', function() {
            var file = createJsFile([
                '// jscs: disable validateQuoteMarks',
                'var x = "1";',
                '// jscs: enable newRule',
                'x++;',
                '// jscs: enable',
                'x--;'
            ].join('\n'));
            var index = createPragmaIndex(file);
            var program = file.getProgram();
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('UpdateExpression')[0])
            ).to.equal(false);
            expect(
                index.isRuleEnabled('newRule', program.selectNodesByType('UpdateExpression')[1])
            ).to.equal(true);
        });

        describe('single line trailing comment', function() {
            it('should ignore a single line', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; // jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(true);
            });

            it('should work with block ignore', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; /*jscs:ignore validateQuoteMarks*/',
                    'var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(true);
            });

            it('should work with block ignore before statement', function() {
                var file = createJsFile([
                    'var x = "1";',
                    '/*jscs:ignore validateQuoteMarks*/ var y = "1";',
                    'var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(true);
            });

            it('should work with block ignore before statement in pair with disable', function() {
                var file = createJsFile([
                    'var x = "1";',
                    '/*jscs:ignore validateQuoteMarks*/ var y = "1";',
                    '/*jscs:disable validateQuoteMarks*/ var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(false);
            });

            it('should work with no space before ignore', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs:ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(true);
            });

            it('should work without a space before `jscs`', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(true);
            });

            it('should not re-enable rules', function() {
                var file = createJsFile([
                    'var a = "1";',
                    '// jscs: disable validateQuoteMarks',
                    'var b = "1"; // jscs: ignore validateQuoteMarks',
                    'var c = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(true);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[2])
                ).to.equal(false);
            });

            it('should also work with multiple rules', function() {
                var file = createJsFile([
                    '// jscs: disable validateQuoteMarks',
                    'var a = "1"; // jscs: ignore validateQuoteMarks, anotherRule',
                    'var b = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('anotherRule', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('anotherRule', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(true);
            });

            it('should be able to ignore all rules', function() {
                var file = createJsFile([
                    'var a = "1"; // jscs: ignore',
                    'var b = "1";'
                ].join('\n'));
                var index = createPragmaIndex(file);
                var program = file.getProgram();
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[0])
                ).to.equal(false);
                expect(
                    index.isRuleEnabled('validateQuoteMarks', program.selectNodesByType('VariableDeclaration')[1])
                ).to.equal(true);
            });
        });
    });
});
