var fs = require('fs');

var expect = require('chai').expect;
var sinon = require('sinon');

var esprima = require('esprima');
var babelJscs = require('babel-jscs');

var assign = require('lodash').assign;
var keywords = Object.keys(require('reserved-words').KEYWORDS[6]);

var JsFile = require('../../lib/js-file');

describe('js-file', function() {

    function createJsFile(sources, options) {
        var params = {
            filename: 'example.js',
            source: sources,
            esprima: esprima
        };

        return new JsFile(assign(params, options));
    }

    function createBabelJsFile(sources) {
        return new JsFile({
            filename: 'example.js',
            source: sources,
            esprima: babelJscs,
            es6: true
        });
    }

    describe('constructor', function() {

        it('empty file should have one token EOF', function() {
            var file = new JsFile({filename: 'example.js', source: '', esprima: esprima});
            expect(!!Array.isArray(file.getTokens())).to.equal(true);
            expect(file.getTokens().length).to.equal(1);
            expect(file.getTokens()[0].type).to.equal('EOF');
        });

        it('should accept broken JS file', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: '/1',
                esprima: esprima
            });
            expect(!!Array.isArray(file.getTokens())).to.equal(true);
            expect(file.getTokens().length).to.equal(1);
            expect(file.getTokens()[0].type).to.equal('EOF');
        });

        // Testing esprima token fix
        // https://code.google.com/p/esprima/issues/detail?id=481
        describe('Keywords -> Identifier fixing', function() {
            it('should affect object keys tokens', function() {
                var str = '({' +
                    'break: true, export: true, return: true, case: true, for: true, switch: true, comment: true,' +
                    'function: true, this: true, continue: true, if: true, typeof: true, default: true, import: true,' +
                    'var: true, delete: true, in: true, void: true, do: true, label: true, while: true, else: true,' +
                    'new: true, with: true, catch: true, try: true, finally: true, \'\': true, null: true, 0: true' +
                    '})';
                createJsFile(str).getTokens().forEach(function(token) {
                    expect(token.type).to.not.equal('Keyword');
                });
            });

            it('should affect method definition tokens', function() {
                var str = keywords.map(function(token) {
                    return token + '() {}';
                });

                str = 'class test {\n' + str.join('\n') + '\n}';

                createJsFile(str).getTokens().forEach(function(token, i) {

                    // Exclude first "class"
                    if (i === 0) {
                        return;
                    }

                    expect(token.type).to.not.equal('Keyword');
                });
            });

            it('should affect member access tokens', function() {
                var str = 'o.break(); o.export(); o.return(); o.case(); o.for(); o.switch(); o.comment();' +
                    'o.function(); o.this(); o.continue(); o.if(); o.typeof(); o.default(); o.import();' +
                    'o.var(); o.delete(); o.in(); o.void(); o.do(); o.label(); o.while(); o.else();' +
                    'o.new(); o.with(); o.catch(); o.try(); o.finally();';
                createJsFile(str).getTokens().forEach(function(token) {
                    expect(token.type).to.not.equal('Keyword');
                });
            });

            it('should not affect valid nested constructions', function() {
                createJsFile('if (true) { if (false); }').getTokens().forEach(function(token) {
                    if (token.value === 'if') {
                        expect(token.type).to.equal('Keyword');
                    }
                });
            });
        });

        it('should handle parse errors', function() {
            var file = new JsFile({
                filename: 'input',
                source: '\n2++;',
                esprima: esprima,
                esprimaOptions: {tolerant: false}
            });
            expect(file.getParseErrors().length).to.equal(1);
            var parseError = file.getParseErrors()[0];
            expect(parseError.description).to.equal('Invalid left-hand side in assignment');
            expect(parseError.lineNumber).to.equal(2);
            expect(parseError.column).to.equal(2);
        });

        describe('grit instructions', function() {
            it('should ignore lines containing only <include> tag', function() {
                var file = createJsFile('<include src="file.js">\n' +
                    '  <include src="file.js">\n' +
                    '< include src="file.js" >\n' +
                    '<include\n' +
                    ' src="file.js">');
                var comments = file._tree.comments;
                var gritTags = comments.filter(function(comment) {
                    return comment.type === 'GritTag';
                });

                expect(comments.length).to.equal(4);
                expect(gritTags.length).to.equal(4);
            });

            it('should ignore lines containing only <if> tag', function() {
                var file = createJsFile('<if expr="false">\n' +
                    '  <if expr="false">\n' +
                    '< if expr="false" >\n' +
                    'var a = 5;\n' +
                    '</if>\n' +
                    '<if\n' +
                    ' expr="false">\n' +
                    'var b = 7;\n' +
                    '</ if>');
                var comments = file._tree.comments;
                var gritTags = comments.filter(function(comment) {
                    return comment.type === 'GritTag';
                });

                expect(comments.length).to.equal(6);
                expect(gritTags.length).to.equal(6);
            });

            it('should not interpret html tags as grit instructions', function() {
                var file = createJsFile('<iframe src="file.js">');
                var comments = file._tree.comments;
                var gritTags = comments.filter(function(comment) {
                    return comment.type === 'GritTag';
                });

                expect(comments.length).to.equal(0);
                expect(gritTags.length).to.equal(0);
            });

            it('should ignore lines containing only <include> case-insensitive tag', function() {
                var file = createJsFile('<includE src="file.js">\n' +
                    '  <includE src="file.js">\n' +
                    '< includE src="file.js" >\n' +
                    '<includE\n' +
                    ' src="file.js">');
                var comments = file._tree.comments;
                var gritTags = comments.filter(function(comment) {
                    return comment.type === 'GritTag';
                });

                expect(comments.length).to.equal(4);
                expect(gritTags.length).to.equal(4);
            });

            it('should ignore lines containing only <if> case-insensitive tag', function() {
                var file = createJsFile('<if expr="false">\n' +
                    '  <iF expr="false">\n' +
                    '< if expr="false" >\n' +
                    'var a = 5;\n' +
                    '</if>\n' +
                    '<iF\n' +
                    ' expr="false">\n' +
                    'var b = 7;\n' +
                    '</ If>');
                var comments = file._tree.comments;
                var gritTags = comments.filter(function(comment) {
                    return comment.type === 'GritTag';
                });

                expect(comments.length).to.equal(6);
                expect(gritTags.length).to.equal(6);
            });
        });
    });

    describe('isEnabledRule', function() {
        it('should always return true when no control comments are used', function() {
            var file = createJsFile(['var x = "1";', 'x++;', 'x--;'].join('\n'));
            expect(!!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
        });

        it('should always return false when jscs is disabled', function() {
            var file = createJsFile(['// jscs: disable', 'var x = "1";', 'x++;', 'x--;'].join('\n'));
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
            expect(!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
        });

        it('should return true when jscs is reenabled', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable',
                'x++;',
                'x--;'
            ].join('\n'));
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 5)).to.equal(true);
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
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 6)).to.equal(true);
        });

        it('should accept block comments', function() {
            var file = createJsFile([
                '/* jscs: disable */',
                'var x = "1";',
                '/* jscs: enable */',
                'x++;',
                'x--;'
            ].join('\n'));
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 5)).to.equal(true);
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
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            expect(!!file.isEnabledRule('newRule', 7)).to.equal(true);
        });

        it('should ignore leading and final comma', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable ,validateQuoteMarks,',
                'x++;'
            ].join('\n'));
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
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
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            expect(!!file.isEnabledRule('validateQuoteMarks', 7)).to.equal(true);
        });

        it('should trim whitespace from the rule name', function() {
            var file = createJsFile([
                '// jscs: disable validateQuoteMarks',
                'var x = "1";'
            ].join('\n'));
            expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            expect(!file.isEnabledRule('validateQuoteMarks  ', 2)).to.equal(true);
            expect(!file.isEnabledRule('    validateQuoteMarks', 2)).to.equal(true);
            expect(!file.isEnabledRule('   validateQuoteMarks   ', 2)).to.equal(true);
        });

        describe('single line trailing comment', function() {
            it('should ignore a single line', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; // jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                expect(!!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
                expect(!!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
            });

            it('should work with no space before jscs:ignore', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                expect(!!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
                expect(!!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
            });

            it('should work without a space before `jscs`', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                expect(!!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
                expect(!!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
            });

            it('should not re-enable rules', function() {
                var file = createJsFile([
                    'var a = "1";',
                    '// jscs: disable validateQuoteMarks',
                    'var b = "1"; // jscs: ignore validateQuoteMarks',
                    'var c = "1";'
                ].join('\n'));
                expect(!!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 4)).to.equal(true);
            });

            it('should also work with multiple rules', function() {
                var file = createJsFile([
                    '// jscs: disable validateQuoteMarks',
                    'var a = "1"; // jscs: ignore validateQuoteMarks, anotherRule',
                    'var b = "1";'
                ].join('\n'));
                expect(!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
                expect(!file.isEnabledRule('validateQuoteMarks', 3)).to.equal(true);
                expect(!!file.isEnabledRule('anotherRule', 1)).to.equal(true);
                expect(!file.isEnabledRule('anotherRule', 2)).to.equal(true);
                expect(!!file.isEnabledRule('anotherRule', 3)).to.equal(true);
            });

            it('should be able to ignore all rules', function() {
                var file = createJsFile([
                    'var a = "1"; // jscs: ignore',
                    'var b = "1";'
                ].join('\n'));
                expect(!file.isEnabledRule('validateQuoteMarks', 1)).to.equal(true);
                expect(!!file.isEnabledRule('validateQuoteMarks', 2)).to.equal(true);
            });
        });
    });

    describe('iterateNodesByType', function() {
        it('should handle ES6 export keyword', function() {
            var spy = sinon.spy();
            createBabelJsFile('export function foo() { var a = "b"; };')
                .iterateNodesByType('VariableDeclaration', spy);
            expect(spy).to.have.callCount(1);
        });
    });

    describe('iterateTokenByValue',  function() {
        it('should find token by value', function() {
            createJsFile('if (true);').iterateTokenByValue(')', function(token, index, tokens) {
                expect(token.value).to.equal(')');
                expect(index).to.equal(4);
                expect(!!Array.isArray(tokens)).to.equal(true);
            });
        });

        it('should find tokens by value', function() {
            createJsFile('if (true);').iterateTokenByValue([')', '('], function(token, index, tokens) {
                expect(!!(token.value === ')' || token.value === '(')).to.equal(true);
                expect(!!(index === 4 || index === 2)).to.equal(true);
                expect(!!Array.isArray(tokens)).to.equal(true);
            });
        });

        it('should not find string value', function() {
            var spy = sinon.spy();
            createJsFile('"("').iterateTokenByValue('(', spy);
            expect(spy).to.have.not.callCount(1);
        });

        it('should not take only own propeties', function() {
            var spy = sinon.spy();
            createJsFile('test.toString').iterateTokenByValue('(', spy);
            expect(spy).to.have.not.callCount(1);
        });

        it('should not have duplicate tokens in es6 export default statements', function() {
            var spy = sinon.spy();
            createBabelJsFile('export default function() {}').iterateTokenByValue('(', spy);
            expect(spy).to.have.callCount(1);
        });

        it('should not have duplicate tokens in es6 export default statements', function() {
            var spy = sinon.spy();
            createBabelJsFile('export default function init() {\n' +
            '  window.addEventListener(\'fb-flo-reload\', function(ev) {\n' +
            '  });\n' +
            '}').iterateTokenByValue('(', spy);
            expect(spy).to.have.callCount(3);
        });
    });

    describe('getNodeByRange', function() {
        it('should throw for incorrect argument', function() {
            expect(function() {
                    createJsFile('function foo(a,b) {}').getNodeByRange({});
                }).to.throw('AssertionError');
        });

        it('should get node by range for function declaration', function() {
            expect(createJsFile('function foo(a,b) {}').getNodeByRange(16).type).to.equal('FunctionDeclaration');
        });

        it('should get node by range for identifier', function() {
            expect(createJsFile('foo(a,b)').getNodeByRange(0).type).to.equal('Identifier');
        });

        it('should get node by range for function expression', function() {
            expect(createJsFile('foo(a,b)').getNodeByRange(7).type).to.equal('CallExpression');
        });

        it('should get node by range for "if" statement', function() {
            expect(createJsFile('if(true){foo(a,b)}').getNodeByRange(0).type).to.equal('IfStatement');
        });

        it('should get node by range for identifier inside "if" statement', function() {
            expect(createJsFile('if(true){foo(a,b)}').getNodeByRange(9).type).to.equal('Identifier');
        });

        it('should get node by range for function expression inside "if" statement', function() {
            expect(createJsFile('if(true){foo(a,b)}').getNodeByRange(16).type).to.equal('CallExpression');
        });

        it('should get node by range for function expression with additional parentheses', function() {
            expect(createJsFile('foo(1,(2))').getNodeByRange(9).type).to.equal('CallExpression');
        });

        it('should return empty object', function() {
            expect(createJsFile('foo(1,2)').getNodeByRange(20).type).to.equal(undefined);
        });

        it('should not throw on regexp', function() {
            var file = createJsFile('/^/');
            try {
                file.getNodeByRange(1);
            } catch (e) {
                throw new Error();
            }
        });
    });

    describe('findNextToken', function() {
        var file;

        beforeEach(function() {
            file = createJsFile('switch(varName){case"yes":a++;break;}');
        });

        it('should find the first next token when only the type is specified', function() {
            var switchToken = file.getTokens()[0];
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier');
            expect(nextToken.type).to.equal('Identifier');
            expect(nextToken.value).to.equal('varName');

            nextToken = file.findNextToken(switchToken, 'Keyword');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('case');

            nextToken = file.findNextToken(switchToken, 'Punctuator');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('(');
        });

        it('should find the first next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier', 'varName');
            expect(nextToken.type).to.equal('Identifier');
            expect(nextToken.value).to.equal('varName');

            nextToken = file.findNextToken(switchToken, 'Keyword', 'case');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('case');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '(');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('(');
        });

        it('should find the correct next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'break');
            expect(nextToken.type).to.equal('Keyword');
            expect(nextToken.value).to.equal('break');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '{');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('{');

            nextToken = file.findNextToken(switchToken, 'Punctuator', ':');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal(':');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '}');
            expect(nextToken.type).to.equal('Punctuator');
            expect(nextToken.value).to.equal('}');
        });

        it('should not find any token if it does not exist', function() {
            var switchToken = file.getTokens()[0];
            expect(switchToken.type).to.equal('Keyword');
            expect(switchToken.value).to.equal('switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'if');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Numeric');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Boolean');
            expect(nextToken).to.equal(null);

            nextToken = file.findNextToken(switchToken, 'Null');
            expect(nextToken).to.equal(null);
        });
    });

    describe('findPrevToken', function() {
        var file;
        var tokens;

        beforeEach(function() {
            file = createJsFile('switch(varName){case"yes":a++;break;}');
            tokens = file.getTokens();
        });

        it('should find the first previous token when only the type is specified', function() {
            var lastToken = tokens[tokens.length - 1];
            expect(lastToken.type).to.equal('EOF');

            var previousToken = file.findPrevToken(lastToken, 'Punctuator');
            var firstPunctuator = previousToken;
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('}');

            previousToken = file.findPrevToken(lastToken, 'Identifier');
            expect(previousToken.type).to.equal('Identifier');
            expect(previousToken.value).to.equal('a');

            previousToken = file.findPrevToken(lastToken, 'Keyword');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('break');

            previousToken = file.findPrevToken(firstPunctuator, 'Punctuator');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(';');
        });

        it('should find the first previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 2];
            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Identifier', 'a');
            expect(previousToken.type).to.equal('Identifier');
            expect(previousToken.value).to.equal('a');

            previousToken = file.findPrevToken(lastToken, 'Keyword', 'break');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('break');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ';');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(';');
        });

        it('should find the correct previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 2];
            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'case');
            expect(previousToken.type).to.equal('Keyword');
            expect(previousToken.value).to.equal('case');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '{');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('{');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ':');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal(':');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '(');
            expect(previousToken.type).to.equal('Punctuator');
            expect(previousToken.value).to.equal('(');
        });

        it('should not find any token if it does not exist', function() {
            var lastToken = tokens[tokens.length - 2];
            expect(lastToken.type).to.equal('Punctuator');
            expect(lastToken.value).to.equal('}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'if');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Numeric');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Boolean');
            expect(previousToken).to.equal(null);

            previousToken = file.findPrevToken(lastToken, 'Null');
            expect(previousToken).to.equal(null);
        });

        it('should find prev token', function() {
            file = createJsFile('if (true);');

            var trueToken = file.getTokens()[3];
            expect(trueToken.type).to.equal('Boolean');
            expect(trueToken.value).to.equal('true');

            var ifToken = file.findPrevToken(trueToken, 'Keyword');
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            ifToken = file.findPrevToken(trueToken, 'Keyword', 'if');
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');
        });
    });

    describe('findNextOperatorToken', function() {
        it('should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], '=');
            expect(token.type).to.equal('Punctuator');
            expect(token.value).to.equal('=');
            expect(token.range[0]).to.equal(2);
        });

        it('should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], 'instanceof');
            expect(token.type).to.equal('Keyword');
            expect(token.value).to.equal('instanceof');
            expect(token.range[0]).to.equal(2);
        });

        it('should return null for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], '-');
            expect(token).to.equal(null);
        });
    });

    describe('findPrevOperatorToken', function() {
        it('should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTokens()[4], '=');
            expect(token.type).to.equal('Punctuator');
            expect(token.value).to.equal('=');
            expect(token.range[0]).to.equal(2);
        });

        it('should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findPrevOperatorToken(file.getTokens()[4], 'instanceof');
            expect(token.type).to.equal('Keyword');
            expect(token.value).to.equal('instanceof');
            expect(token.range[0]).to.equal(2);
        });

        it('should return null for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTokens()[4], '-');
            expect(token).to.equal(null);
        });
    });

    describe('getTokenByRangeStart', function() {
        it('should return token for specified start position', function() {
            var file = createJsFile('if (true) { x++; }');

            var ifToken = file.getTokenByRangeStart(0);
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            var incToken = file.getTokenByRangeStart(12);
            expect(incToken.type).to.equal('Identifier');
            expect(incToken.value).to.equal('x');
        });

        it('should return null if token was not found', function() {
            var file = createJsFile('if (true) { x++; }');

            var token = file.getTokenByRangeStart(1);
            expect(token).to.equal(null);
        });
    });

    describe('getTokenByRangeEnd', function() {
        it('should return token for specified end position', function() {
            var file = createJsFile('if (true) { x++; }');

            var ifToken = file.getTokenByRangeEnd(2);
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            var incToken = file.getTokenByRangeEnd(13);
            expect(incToken.type).to.equal('Identifier');
            expect(incToken.value).to.equal('x');
        });

        it('should return null if token was not found', function() {
            var file = createJsFile('if (true) { x++; }');

            var token = file.getTokenByRangeEnd(3);
            expect(token).to.equal(null);
        });
    });

    describe('getFirstNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstNodeToken(file.getNodesByType('IfStatement')[0]);
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');

            var incToken = file.getFirstNodeToken(file.getNodesByType('UpdateExpression')[0]);
            expect(incToken.type).to.equal('Identifier');
            expect(incToken.value).to.equal('x');
        });
    });

    describe('getLastNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getLastNodeToken(file.getNodesByType('IfStatement')[0]);
            expect(ifToken.type).to.equal('Punctuator');
            expect(ifToken.value).to.equal('}');

            var incToken = file.getLastNodeToken(file.getNodesByType('UpdateExpression')[0]);
            expect(incToken.type).to.equal('Punctuator');
            expect(incToken.value).to.equal('++');
        });
    });

    describe('getFirstToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstToken({includeComments: true});
            expect(ifToken.type).to.equal('Keyword');
            expect(ifToken.value).to.equal('if');
        });
    });

    describe('getLastToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var EOFToken = file.getLastToken({includeComments: true});
            expect(EOFToken.type).to.equal('EOF');
        });
    });

    describe('getNodesByFirstToken', function() {
        describe('invalid arguments', function() {
            var file;
            beforeEach(function() {
                file = createJsFile('x++;y++;');
            });

            it('should return empty array if the argument is invalid', function() {
                var nodes = file.getNodesByFirstToken();
                expect(nodes.length).to.equal(0);
            });

            it('should return empty array if the argument.range is invalid', function() {
                var nodes = file.getNodesByFirstToken({});
                expect(nodes.length).to.equal(0);
            });

            it('should return empty array if the argument.range[0] is invalid', function() {
                var nodes = file.getNodesByFirstToken({
                    range: {}
                });
                expect(nodes.length).to.equal(0);
            });
        });

        describe('empty progam', function() {
            var file;
            beforeEach(function() {
                file = createJsFile('');
            });

            it('should return 1 node of type Program when provided the first token', function() {
                var token = file.getFirstToken({includeComments: true});
                var nodes = file.getNodesByFirstToken(token);
                expect(nodes.length).to.equal(1);
                expect(nodes[0].type).to.equal('Program');
            });
        });

        describe('normal progam', function() {
            var file;
            beforeEach(function() {
                file = createJsFile('var x;\ndo {\n\tx++;\n} while (x < 10);');
            });

            it('should return nodes when supplied with a token that is the start of a node', function() {
                var token = file.getFirstToken({includeComments: true});
                var nodes = file.getNodesByFirstToken(token);
                expect(nodes.length).to.equal(2);
                expect(nodes[0].type).to.equal('Program');
                expect(nodes[1].type).to.equal('VariableDeclaration');
            });

            it('should return an empty array when supplied with a token that is not the start of a node', function() {
                var token = file.getFirstToken({includeComments: true});
                var nextToken = file.findNextToken(token, 'Keyword', 'while');
                var nodes = file.getNodesByFirstToken(nextToken);
                expect(nodes.length).to.equal(0);
            });
        });
    });

    describe('getNodesByType', function() {
        it('should return nodes using specified type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Identifier');
            expect(nodes.length).to.equal(2);
            expect(nodes[0].type).to.equal('Identifier');
            expect(nodes[0].name).to.equal('x');
            expect(nodes[1].type).to.equal('Identifier');
            expect(nodes[1].name).to.equal('y');
        });

        it('should return empty array for non-existing type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Literal');
            expect(nodes.length).to.equal(0);
        });

        it('should accept array as an argument', function() {
            var nodes = createJsFile('x += 1;').getNodesByType(['Identifier', 'Literal']);
            expect(nodes.length).to.equal(2);
            expect(nodes[0].type).to.equal('Identifier');
            expect(nodes[0].name).to.equal('x');
            expect(nodes[1].type).to.equal('Literal');
            expect(nodes[1].value).to.equal(1);
        });

        it('should return empty array for non-existing type array', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType(['Literal', 'BinaryExpression']);
            expect(nodes.length).to.equal(0);
        });
    });

    describe('getFirstLineToken', function() {
        it('should return first line token', function() {
            var file = createJsFile('x += 1;\ny += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var yToken = file.getFirstTokenOnLine(2);
            expect(yToken.type).to.equal('Identifier');
            expect(yToken.value).to.equal('y');
        });

        it('should return first line token if token is indented', function() {
            var file = createJsFile('\t\tx += 1;\n\t\ty += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var yToken = file.getFirstTokenOnLine(2);
            expect(yToken.type).to.equal('Identifier');
            expect(yToken.value).to.equal('y');
        });

        it('should return null if no token was found', function() {
            var file = createJsFile('\t\tx += 1;\n\n');
            var yToken = file.getFirstTokenOnLine(2);
            expect(yToken).to.equal(null);
        });

        it('should return null if only comment was found', function() {
            var file = createJsFile('\t\tx += 1;\n/*123*/\n');
            var yToken = file.getFirstTokenOnLine(2);
            expect(yToken).to.equal(null);
        });

        it('should return first line token ignoring comments', function() {
            var file = createJsFile('\t/* 123 */\tx += 1;\n\t/* 321 */\ty += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var yToken = file.getFirstTokenOnLine(2);
            expect(yToken.type).to.equal('Identifier');
            expect(yToken.value).to.equal('y');
        });

        it('should return first line token including comments', function() {
            var file = createJsFile('\t/*123*/\tx += 1;\n\t/*321*/\ty += 4;');
            var commentToken1 = file.getFirstTokenOnLine(1, {includeComments: true});
            expect(!!commentToken1.isComment).to.equal(true);
            expect(commentToken1.type).to.equal('CommentBlock');
            expect(commentToken1.value).to.equal('123');
            var commentToken2 = file.getFirstTokenOnLine(2, {includeComments: true});
            expect(!!commentToken2.isComment).to.equal(true);
            expect(commentToken2.type).to.equal('CommentBlock');
            expect(commentToken2.value).to.equal('321');
        });

        it('should return null if no token was found including comments', function() {
            var file = createJsFile('\t\tx += 1;\n\n');
            var yToken = file.getFirstTokenOnLine(2, {includeComments: true});
            expect(yToken).to.equal(null);
        });
    });

    describe('getLastLineToken', function() {
        it('should return last line token', function() {
            var file = createJsFile('x = 1;\nif (x) {}\n');
            var xToken = file.getLastTokenOnLine(1);
            expect(xToken.type).to.equal('Punctuator');
            expect(xToken.value).to.equal(';');
            var ifToken = file.getLastTokenOnLine(2);
            expect(ifToken.type).to.equal('Punctuator');
            expect(ifToken.value).to.equal('}');
        });

        it('should return null if no token was found', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1);
            expect(noToken).to.equal(null);
        });

        it('should return null if only comment was found', function() {
            var file = createJsFile('\t\tx += 1;\n/*123*/\n');
            var noToken = file.getLastTokenOnLine(2);
            expect(noToken).to.equal(null);
        });

        it('should return last line token ignoring comments', function() {
            var file = createJsFile('x = 1; /* 321 */\n');
            var xToken = file.getLastTokenOnLine(1);
            expect(xToken.type).to.equal('Punctuator');
            expect(xToken.value).to.equal(';');
        });

        it('should return last line token including comments', function() {
            var file = createJsFile('x = 1; /*123*/\n');
            var commentToken = file.getLastTokenOnLine(1, {includeComments: true});
            expect(!!commentToken.isComment).to.equal(true);
            expect(commentToken.type).to.equal('CommentBlock');
            expect(commentToken.value).to.equal('123');
        });

        it('should return null if no token was found including comments', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1, {includeComments: true});
            expect(noToken).to.equal(null);
        });
    });

    describe('iterate', function() {
        it('should iterate all nodes in the document', function() {
            var file = createJsFile('x++;');

            var spy = sinon.spy();
            file.iterate(spy);

            expect(spy).to.have.callCount(4);

            expect(spy.getCall(0).args[0].type).to.equal('Program');
            expect(spy.getCall(1).args[0].type).to.equal('ExpressionStatement');
            expect(spy.getCall(2).args[0].type).to.equal('UpdateExpression');
            expect(spy.getCall(3).args[0].type).to.equal('Identifier');
        });

        it('should iterate nested nodes', function() {
            var file = createJsFile('x = (5 + 4) && (3 + 1);');

            var spy = sinon.spy();
            file.iterate(spy, file.getNodesByType('LogicalExpression')[0].left);

            expect(spy).to.have.callCount(3);
            expect(spy.getCall(0).args[0].type).to.equal('BinaryExpression');
            expect(spy.getCall(1).args[0].type).to.equal('Literal');
            expect(spy.getCall(1).args[0].value).to.equal(5);
            expect(spy.getCall(2).args[0].type).to.equal('Literal');
            expect(spy.getCall(2).args[0].value).to.equal(4);
        });
    });

    describe('iterateNodesByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('Identifier', spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].name).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Identifier');
            expect(spy.getCall(1).args[0].name).to.equal('y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('Literal', spy);
            expect(spy).to.have.callCount(0);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateNodesByType(['Identifier', 'Literal'], spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].name).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Literal');
            expect(spy.getCall(1).args[0].value).to.equal(1);
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType(['Literal', 'BinaryExpression'], spy);
            expect(spy).to.have.callCount(0);
        });
    });

    describe('iterateTokensByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Identifier', spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].value).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Identifier');
            expect(spy.getCall(1).args[0].value).to.equal('y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Boolean', spy);
            expect(spy).to.have.callCount(0);
        });

        it('should apply callback for line comments', function() {
            var spy = sinon.spy();
            createJsFile('//foo').iterateTokensByType('CommentLine', spy);
            expect(spy).to.have.callCount(1);
        });

        it('should apply callback for block comments', function() {
            var spy = sinon.spy();
            createJsFile('/*foo*/').iterateTokensByType('CommentBlock', spy);
            expect(spy).to.have.callCount(1);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateTokensByType(['Identifier', 'Numeric'], spy);
            expect(spy).to.have.callCount(2);
            expect(spy.getCall(0).args[0].type).to.equal('Identifier');
            expect(spy.getCall(0).args[0].value).to.equal('x');
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal('1');
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType(['Boolean', 'Numeric'], spy);
            expect(spy).to.have.callCount(0);
        });
    });

    describe('getTree', function() {
        it('should return empty token tree for non-existing esprima-tree', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            expect(file.getTree()).to.be.a('object');
            expect(file.getTree()).to.not.equal(null);
        });
    });

    describe('getSource', function() {
        it('should return specified source code', function() {
            var sources = 'var x = 1;\nvar y = 2;';
            var file = createJsFile(sources);
            expect(file.getSource()).to.equal(sources);
        });
    });

    describe('getTokens', function() {
        it('should return EOF for empty string', function() {
            var tokens = createJsFile('').getTokens();
            expect(tokens.length).to.equal(1);
            expect(tokens[0].type).to.equal('EOF');
        });

        it('should end with EOF', function() {
            var tokens = createJsFile('if(true) {\nvar a = 2;\n}').getTokens();
            expect(tokens[tokens.length - 1].type).to.equal('EOF');
        });

        it('should include comments', function() {
            var tokens = createJsFile('/* foo */').getTokens();
            expect(tokens[0].type).to.equal('CommentBlock');
        });
    });

    describe('getDialect', function() {
        var sources = 'var x = 1;\nvar y = 2;';

        it('should return es5 with no options specified', function() {
            var file = createJsFile(sources);
            expect(file.getDialect()).to.equal('es5');
        });

        it('should return es6 when es6 is specified as true', function() {
            var file = createJsFile(sources, {es6: true});
            expect(file.getDialect()).to.equal('es6');
        });

        it('should return es5 when es6 is specified as false', function() {
            var file = createJsFile(sources, {es6: false});
            expect(file.getDialect()).to.equal('es5');
        });

        it('should return es3 when es3 is specified as true', function() {
            var file = createJsFile(sources, {es3: true});
            expect(file.getDialect()).to.equal('es3');
        });

        it('should return es5 when es3 is specified as false', function() {
            var file = createJsFile(sources, {es3: false});
            expect(file.getDialect()).to.equal('es5');
        });

        it('should return es6 when es3 and es6 are both specified as true', function() {
            var file = createJsFile(sources, {es3: true, es6: true});
            expect(file.getDialect()).to.equal('es6');
        });
    });

    describe('getLines', function() {
        it('should return specified source code lines', function() {
            var sources = ['var x = 1;', 'var y = 2;'];
            var file = createJsFile(sources.join('\n'));
            expect(file.getLines().length).to.equal(2);
            expect(file.getLines()[0]).to.equal(sources[0]);
            expect(file.getLines()[1]).to.equal(sources[1]);
        });

        it('should accept all line endings', function() {
            var lineEndings = ['\r\n', '\r', '\n'];

            lineEndings.forEach(function(lineEnding) {
                var sources = ['var x = 1;', 'var y = 2;'];
                var file = createJsFile(sources.join(lineEnding));
                expect(file.getLines().length).to.equal(2);
                expect(file.getLines()[0]).to.equal(sources[0]);
                expect(file.getLines()[1]).to.equal(sources[1]);
            });
        });
    });

    describe('getScope', function() {
        it('should lazy initialize', function() {
            var sources = ['var x = 1;', 'var y = 2;'];
            var file = createJsFile(sources.join('\n'));
            expect(file._scope).to.equal(null);

            expect(file.getScope()).to.be.a('object');
            expect(file._scope).to.be.not.a('null');
        });

        it('should ignore eval', function(done) {
            var sources = ['function f(options) { return options; eval(); }'];
            var file = createJsFile(sources.join('\n'));

            file.iterateNodesByType(['FunctionDeclaration', 'FunctionExpression'], function(node) {
                expect(file.getScope().acquire(node).variables[1].references.length).to.equal(1);
                done();
            });
        });
    });

    describe('removeToken', function() {
        it('should remove token', function() {
            var source = 'y = 2;';
            var file = createJsFile(source);

            var tokens = file.getTokens();

            // Remove EOF
            file.removeToken(tokens[tokens.length - 1]);

            // Remove ";"
            file.removeToken(tokens[tokens.length - 1]);
            expect(file.render()).to.equal('y = 2');
        });
    });

    describe('getLinesWithCommentsRemoved', function() {
        it('should strip line comments', function() {
            var source = 'a++; //comment\n//comment';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(2);
            expect(lines[0]).to.equal('a++; ');
            expect(lines[1]).to.equal('');
        });

        it('should strip single-line block comments', function() {
            var source = 'a++;/*comment*/b++;\n/*comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(2);
            expect(lines[0]).to.equal('a++;b++;');
            expect(lines[1]).to.equal('');
        });

        it('should strip multi-line block comments', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(3);
            expect(lines[0]).to.equal('a++;');
            expect(lines[1]).to.equal('');
            expect(lines[2]).to.equal('');
        });

        it('should strip an multi-line block comments with trailing tokens', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/b++;';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            expect(lines.length).to.equal(3);
            expect(lines[0]).to.equal('a++;');
            expect(lines[1]).to.equal('');
            expect(lines[2]).to.equal('b++;');
        });

        it('should preserve comment order', function() {
            var source = '//comment1\n//comment2';
            var file = createJsFile(source);

            file.getLinesWithCommentsRemoved();
            expect(file.getComments()[0].value).to.equal('comment1');
            expect(file.getComments()[1].value).to.equal('comment2');
        });
    });

    describe('getFilename', function() {
        it('should return given filename', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: 'Hello\nWorld',
                esprima: esprima
            });
            expect(file.getFilename()).to.equal('example.js');
        });
    });

    describe('render', function() {
        var relativeDirPath = '../data/render';
        var absDirPath = __dirname + '/' + relativeDirPath;
        fs.readdirSync(absDirPath).forEach(function(filename) {
            it('file ' + relativeDirPath + '/' + filename + ' should be rendered correctly', function() {
                var source = fs.readFileSync(absDirPath + '/' + filename, 'utf8');
                var file = createBabelJsFile(source);
                expect(file.render()).to.equal(source);
            });
        });
    });

    describe('getLineBreaks', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            expect(file.getLineBreaks()).to.deep.equal(['\n']);
        });

        it('should return empty array for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello', esprima: esprima});
            expect(file.getLineBreaks()).to.deep.equal([]);
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld', esprima: esprima});
            expect(file.getLineBreaks()).to.deep.equal(['\r']);
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld', esprima: esprima});
            expect(file.getLineBreaks()).to.deep.equal(['\r\n']);
        });
    });

    describe('getLineBreakStyle', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            expect(file.getLineBreakStyle()).to.equal('\n');
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld', esprima: esprima});
            expect(file.getLineBreakStyle()).to.equal('\r');
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld', esprima: esprima});
            expect(file.getLineBreakStyle()).to.equal('\r\n');
        });

        it('should return \\n for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello', esprima: esprima});
            expect(file.getLineBreakStyle()).to.equal('\n');
        });

        it('should return first line break for mixed file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld\r\n!', esprima: esprima});
            expect(file.getLineBreakStyle()).to.equal(file.getLineBreaks()[0]);
        });
    });

    describe('getNextToken', function() {
        it('should return next token', function() {
            var file = createJsFile('x++');
            var xToken = file.getTokens()[0];
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var next = file.getNextToken(xToken);
            expect(next.type).to.equal('Punctuator');
            expect(next.value).to.equal('++');
        });

        it('should return EOF token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var next = file.getNextToken(xToken);
            expect(next.type).to.equal('EOF');
            expect(next.value).to.equal('');
        });

        it('should return null for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            var next = file.getNextToken(file.getNextToken(xToken));
            expect(next).to.equal(null);
        });

        it('should ignore comments', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTokens()[0];
            var next = file.getNextToken(xToken, {includeComments: false});
            expect(next.type).to.equal('EOF');
            expect(next.value).to.equal('');
        });

        it('should return next comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTokens()[0];
            var next = file.getNextToken(xToken, {includeComments: true});
            expect(next.type).to.equal('CommentBlock');
        });

        it('should return EOF next to comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getComments()[0];
            var next = file.getNextToken(xToken, {includeComments: true});
            expect(next.type).to.equal('EOF');
        });

        it('should return null if there is where to go', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[1];
            var next = file.getNextToken(xToken);
            expect(next).to.equal(null);
        });
    });

    describe('getPrevToken', function() {
        it('should return previous token', function() {
            var file = createJsFile('++x');
            var xToken = file.getTokens()[1];
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var prev = file.getPrevToken(xToken);
            expect(prev.type).to.equal('Punctuator');
            expect(prev.value).to.equal('++');
        });

        it('should return null for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            expect(xToken.type).to.equal('Identifier');
            expect(xToken.value).to.equal('x');
            var prev = file.getPrevToken(xToken);
            expect(prev).to.equal(null);
        });

        it('should ignore comments', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTokens()[1];
            var prev = file.getPrevToken(xToken, {includeComments: false});
            expect(prev).to.equal(null);
        });

        it('should return previous comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTokens()[1];
            var prev = file.getPrevToken(xToken, {includeComments: true});
            expect(prev.type).to.equal('CommentBlock');
        });

        it('should return null prev to comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getComments()[0];
            var prev = file.getPrevToken(xToken, {includeComments: true});
            expect(prev).to.equal(null);
        });

        it('should return null if there is where to go', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            var prev = file.getPrevToken(xToken);
            expect(prev).to.equal(null);
        });
    });

    describe('iterateTokensByTypeAndValue', function() {
        it('should match specified type', function() {
            var file = createJsFile('var x = 1 + 1; /*1*/ //1');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', '1', spy);

            expect(spy).to.have.callCount(2);

            expect(spy.getCall(0).args[0].type).to.equal('Numeric');
            expect(spy.getCall(0).args[0].value).to.equal('1');
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal('1');
        });

        it('should accept value list', function() {
            var file = createJsFile('var x = 1 + 2 + "2"; /*1*/ //2');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', ['1', '2'], spy);

            expect(spy).to.have.callCount(2);

            expect(spy.getCall(0).args[0].type).to.equal('Numeric');
            expect(spy.getCall(0).args[0].value).to.equal('1');
            expect(spy.getCall(1).args[0].type).to.equal('Numeric');
            expect(spy.getCall(1).args[0].value).to.equal('2');
        });
    });

    describe('getWhitespaceBefore', function() {
        it('should return whitespace before the first token', function() {
            var file = createJsFile('  \nx;');
            expect(file.getWhitespaceBefore(file.getFirstToken())).to.equal('  \n');
        });

        it('should return whitespace before the EOF', function() {
            var file = createJsFile('\n  ');
            expect(file.getWhitespaceBefore(file.getLastToken())).to.equal('\n  ');
        });

        it('should return empty for tokens without whitespace before', function() {
            var file = createJsFile('x');
            expect(file.getWhitespaceBefore(file.getFirstToken())).to.equal('');
        });
    });

    describe('setWhitespaceBefore', function() {
        it('should alter existing whitespace token', function() {
            var file = createJsFile('  x');
            expect(file.getTokens().length).to.equal(3);
            file.setWhitespaceBefore(file.getFirstToken(), '\n');
            expect(file.getTokens().length).to.equal(3);
            expect(file.getTokens()[0].value).to.equal('\n');
        });

        it('should insert new whitespace token', function() {
            var file = createJsFile('x');
            expect(file.getTokens().length).to.equal(2);
            file.setWhitespaceBefore(file.getFirstToken(), '\n');
            expect(file.getTokens().length).to.equal(3);
            expect(file.getTokens()[0].value).to.equal('\n');
        });

        it('should drop whitespace token', function() {
            var file = createJsFile('  x');
            expect(file.getTokens().length).to.equal(3);
            file.setWhitespaceBefore(file.getFirstToken(), '');
            expect(file.getTokens().length).to.equal(2);
            expect(file.getTokens()[0].type).to.equal('Identifier');
        });

        it('should ignore already absent whitespace token', function() {
            var file = createJsFile('x');
            expect(file.getTokens().length).to.equal(2);
            file.setWhitespaceBefore(file.getFirstToken(), '');
            expect(file.getTokens().length).to.equal(2);
            expect(file.getTokens()[0].type).to.equal('Identifier');
        });
    });
});
