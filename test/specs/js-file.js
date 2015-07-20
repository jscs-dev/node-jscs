var assert = require('assert');
var esprima = require('esprima');
var babelJscs = require('babel-jscs');
var JsFile = require('../../lib/js-file');
var sinon = require('sinon');
var fs = require('fs');
var assign = require('lodash.assign');

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
            assert(Array.isArray(file.getTokens()));
            assert.equal(file.getTokens().length, 1);
            assert.equal(file.getTokens()[0].type, 'EOF');
        });

        it('should accept broken JS file', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: '/1',
                esprima: esprima
            });
            assert(Array.isArray(file.getTokens()));
            assert.equal(file.getTokens().length, 1);
            assert.equal(file.getTokens()[0].type, 'EOF');
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
                    assert(token.type !== 'Keyword');
                });
            });

            it('should affect member access tokens', function() {
                var str = 'o.break(); o.export(); o.return(); o.case(); o.for(); o.switch(); o.comment();' +
                    'o.function(); o.this(); o.continue(); o.if(); o.typeof(); o.default(); o.import();' +
                    'o.var(); o.delete(); o.in(); o.void(); o.do(); o.label(); o.while(); o.else();' +
                    'o.new(); o.with(); o.catch(); o.try(); o.finally();';
                createJsFile(str).getTokens().forEach(function(token) {
                    assert(token.type !== 'Keyword');
                });
            });

            it('should not affect valid nested constructions', function() {
                createJsFile('if (true) { if (false); }').getTokens().forEach(function(token) {
                    if (token.value === 'if') {
                        assert(token.type === 'Keyword');
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
            assert.equal(file.getParseErrors().length, 1);
            var parseError = file.getParseErrors()[0];
            assert.equal(parseError.description, 'Invalid left-hand side in assignment');
            assert.equal(parseError.lineNumber, 2);
            assert.equal(parseError.column, 2);
        });

        it('should ignore lines containing only <include> tag', function() {
            var file = createJsFile('<include src="file.js">\n' +
                '  <include src="file.js">\n' +
                '< include src="file.js" >\n' +
                '<include\n' +
                ' src="file.js">\n' +
                'var a = 5;\n');
            var comments = file._tree.comments;
            var gritTags = comments.filter(function(comment) {
                return comment.type === 'GritTag';
            });

            assert.equal(4, comments.length);
            assert.equal(4, gritTags.length);
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

            assert.equal(6, comments.length);
            assert.equal(6, gritTags.length);
        });
    });

    describe('isEnabledRule', function() {
        it('should always return true when no control comments are used', function() {
            var file = createJsFile(['var x = "1";', 'x++;', 'x--;'].join('\n'));
            assert(file.isEnabledRule('validateQuoteMarks', 1));
            assert(file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 3));
        });

        it('should always return false when jscs is disabled', function() {
            var file = createJsFile(['// jscs: disable', 'var x = "1";', 'x++;', 'x--;'].join('\n'));
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(!file.isEnabledRule('validateQuoteMarks', 3));
            assert(!file.isEnabledRule('validateQuoteMarks', 4));
        });

        it('should return true when jscs is reenabled', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable',
                'x++;',
                'x--;'
            ].join('\n'));
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 4));
            assert(file.isEnabledRule('validateQuoteMarks', 5));
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
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 4));
            assert(file.isEnabledRule('validateQuoteMarks', 6));
        });

        it('should accept block comments', function() {
            var file = createJsFile([
                '/* jscs: disable */',
                'var x = "1";',
                '/* jscs: enable */',
                'x++;',
                'x--;'
            ].join('\n'));
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 4));
            assert(file.isEnabledRule('validateQuoteMarks', 5));
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
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 4));
            assert(file.isEnabledRule('newRule', 7));
        });

        it('should ignore leading and final comma', function() {
            var file = createJsFile([
                '// jscs: disable',
                'var x = "1";',
                '// jscs: enable ,validateQuoteMarks,',
                'x++;'
            ].join('\n'));
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(file.isEnabledRule('validateQuoteMarks', 4));
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
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(!file.isEnabledRule('validateQuoteMarks', 4));
            assert(file.isEnabledRule('validateQuoteMarks', 7));
        });

        it('should trim whitespace from the rule name', function() {
            var file = createJsFile([
                '// jscs: disable validateQuoteMarks',
                'var x = "1";'
            ].join('\n'));
            assert(!file.isEnabledRule('validateQuoteMarks', 2));
            assert(!file.isEnabledRule('validateQuoteMarks  ', 2));
            assert(!file.isEnabledRule('    validateQuoteMarks', 2));
            assert(!file.isEnabledRule('   validateQuoteMarks   ', 2));
        });

        describe('single line trailing comment', function() {
            it('should ignore a single line', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; // jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                assert(file.isEnabledRule('validateQuoteMarks', 1));
                assert(!file.isEnabledRule('validateQuoteMarks', 2));
                assert(file.isEnabledRule('validateQuoteMarks', 3));
            });

            it('should work with no space before jscs:ignore', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                assert(file.isEnabledRule('validateQuoteMarks', 1));
                assert(!file.isEnabledRule('validateQuoteMarks', 2));
                assert(file.isEnabledRule('validateQuoteMarks', 3));
            });

            it('should work without a space before `jscs`', function() {
                var file = createJsFile([
                    'var x = "1";',
                    'var y = "1"; //jscs: ignore validateQuoteMarks',
                    'var z = "1";'
                ].join('\n'));
                assert(file.isEnabledRule('validateQuoteMarks', 1));
                assert(!file.isEnabledRule('validateQuoteMarks', 2));
                assert(file.isEnabledRule('validateQuoteMarks', 3));
            });

            it('should not re-enable rules', function() {
                var file = createJsFile([
                    'var a = "1";',
                    '// jscs: disable validateQuoteMarks',
                    'var b = "1"; // jscs: ignore validateQuoteMarks',
                    'var c = "1";'
                ].join('\n'));
                assert(file.isEnabledRule('validateQuoteMarks', 1));
                assert(!file.isEnabledRule('validateQuoteMarks', 2));
                assert(!file.isEnabledRule('validateQuoteMarks', 3));
                assert(!file.isEnabledRule('validateQuoteMarks', 4));
            });

            it('should also work with multiple rules', function() {
                var file = createJsFile([
                    '// jscs: disable validateQuoteMarks',
                    'var a = "1"; // jscs: ignore validateQuoteMarks, anotherRule',
                    'var b = "1";'
                ].join('\n'));
                assert(!file.isEnabledRule('validateQuoteMarks', 1));
                assert(!file.isEnabledRule('validateQuoteMarks', 2));
                assert(!file.isEnabledRule('validateQuoteMarks', 3));
                assert(file.isEnabledRule('anotherRule', 1));
                assert(!file.isEnabledRule('anotherRule', 2));
                assert(file.isEnabledRule('anotherRule', 3));
            });

            it('should be able to ignore all rules', function() {
                var file = createJsFile([
                    'var a = "1"; // jscs: ignore',
                    'var b = "1";'
                ].join('\n'));
                assert(!file.isEnabledRule('validateQuoteMarks', 1));
                assert(file.isEnabledRule('validateQuoteMarks', 2));
            });
        });
    });

    describe('iterateNodesByType', function() {
        it('should handle ES6 export keyword', function() {
            var spy = sinon.spy();
            createBabelJsFile('export function foo() { var a = "b"; };')
                .iterateNodesByType('VariableDeclaration', spy);
            assert(spy.calledOnce);
        });
    });

    describe('iterateTokenByValue',  function() {
        it('should find token by value', function() {
            createJsFile('if (true);').iterateTokenByValue(')', function(token, index, tokens) {
                assert(token.value === ')');
                assert(index === 3);
                assert(Array.isArray(tokens));
            });
        });

        it('should find tokens by value', function() {
            createJsFile('if (true);').iterateTokenByValue([')', '('], function(token, index, tokens) {
                assert(token.value === ')' || token.value === '(');
                assert(index === 3 || index === 1);
                assert(Array.isArray(tokens));
            });
        });

        it('should not find string value', function() {
            var spy = sinon.spy();
            createJsFile('"("').iterateTokenByValue('(', spy);
            assert(!spy.calledOnce);
        });

        it('should not take only own propeties', function() {
            var spy = sinon.spy();
            createJsFile('test.toString').iterateTokenByValue('(', spy);
            assert(!spy.calledOnce);
        });

        it('should not have duplicate tokens in es6 export default statements', function() {
            var spy = sinon.spy();
            createBabelJsFile('export default function() {}').iterateTokenByValue('(', spy);
            assert(spy.calledOnce);
        });

        it('should not have duplicate tokens in es6 export default statements', function() {
            var spy = sinon.spy();
            createBabelJsFile('export default function init() {\n' +
            '  window.addEventListener(\'fb-flo-reload\', function(ev) {\n' +
            '  });\n' +
            '}').iterateTokenByValue('(', spy);
            assert(spy.calledThrice);
        });
    });

    describe('getNodeByRange', function() {
        it('should get node by range for function declaration', function() {
            assert.equal(createJsFile('function foo(a,b) {}').getNodeByRange(16).type, 'FunctionDeclaration');
        });

        it('should get node by range for identifier', function() {
            assert.equal(createJsFile('foo(a,b)').getNodeByRange(0).type, 'Identifier');
        });

        it('should get node by range for function expression', function() {
            assert.equal(createJsFile('foo(a,b)').getNodeByRange(7).type, 'CallExpression');
        });

        it('should get node by range for "if" statement', function() {
            assert.equal(createJsFile('if(true){foo(a,b)}').getNodeByRange(0).type, 'IfStatement');
        });

        it('should get node by range for identifier inside "if" statement', function() {
            assert.equal(createJsFile('if(true){foo(a,b)}').getNodeByRange(9).type, 'Identifier');
        });

        it('should get node by range for function expression inside "if" statement', function() {
            assert.equal(createJsFile('if(true){foo(a,b)}').getNodeByRange(16).type, 'CallExpression');
        });

        it('should get node by range for function expression with additional parentheses', function() {
            assert.equal(createJsFile('foo(1,(2))').getNodeByRange(9).type, 'CallExpression');
        });

        it('should return empty object', function() {
            assert.equal(createJsFile('foo(1,2)').getNodeByRange(20).type, undefined);
        });

        it('should not throw on regexp', function() {
            var file = createJsFile('/^/');
            try {
                file.getNodeByRange(1);
                assert(true);
            } catch (e) {
                assert(false);
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
            assert.equal(switchToken.type, 'Keyword');
            assert.equal(switchToken.value, 'switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier');
            assert.equal(nextToken.type, 'Identifier');
            assert.equal(nextToken.value, 'varName');

            nextToken = file.findNextToken(switchToken, 'Keyword');
            assert.equal(nextToken.type, 'Keyword');
            assert.equal(nextToken.value, 'case');

            nextToken = file.findNextToken(switchToken, 'Punctuator');
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '(');
        });

        it('should find the first next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            assert.equal(switchToken.type, 'Keyword');
            assert.equal(switchToken.value, 'switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier', 'varName');
            assert.equal(nextToken.type, 'Identifier');
            assert.equal(nextToken.value, 'varName');

            nextToken = file.findNextToken(switchToken, 'Keyword', 'case');
            assert.equal(nextToken.type, 'Keyword');
            assert.equal(nextToken.value, 'case');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '(');
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '(');
        });

        it('should find the correct next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            assert.equal(switchToken.type, 'Keyword');
            assert.equal(switchToken.value, 'switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'break');
            assert.equal(nextToken.type, 'Keyword');
            assert.equal(nextToken.value, 'break');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '{');
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '{');

            nextToken = file.findNextToken(switchToken, 'Punctuator', ':');
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, ':');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '}');
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '}');
        });

        it('should not find any token if it does not exist', function() {
            var switchToken = file.getTokens()[0];
            assert.equal(switchToken.type, 'Keyword');
            assert.equal(switchToken.value, 'switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'if');
            assert.equal(nextToken, undefined);

            nextToken = file.findNextToken(switchToken, 'Numeric');
            assert.equal(nextToken, undefined);

            nextToken = file.findNextToken(switchToken, 'Boolean');
            assert.equal(nextToken, undefined);

            nextToken = file.findNextToken(switchToken, 'Null');
            assert.equal(nextToken, undefined);
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
            assert.equal(lastToken.type, 'EOF');

            var previousToken = file.findPrevToken(lastToken, 'Punctuator');
            var firstPunctuator = previousToken;
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, '}');

            previousToken = file.findPrevToken(lastToken, 'Identifier');
            assert.equal(previousToken.type, 'Identifier');
            assert.equal(previousToken.value, 'a');

            previousToken = file.findPrevToken(lastToken, 'Keyword');
            assert.equal(previousToken.type, 'Keyword');
            assert.equal(previousToken.value, 'break');

            previousToken = file.findPrevToken(firstPunctuator, 'Punctuator');
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, ';');
        });

        it('should find the first previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 2];
            assert.equal(lastToken.type, 'Punctuator');
            assert.equal(lastToken.value, '}');

            var previousToken = file.findPrevToken(lastToken, 'Identifier', 'a');
            assert.equal(previousToken.type, 'Identifier');
            assert.equal(previousToken.value, 'a');

            previousToken = file.findPrevToken(lastToken, 'Keyword', 'break');
            assert.equal(previousToken.type, 'Keyword');
            assert.equal(previousToken.value, 'break');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ';');
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, ';');
        });

        it('should find the correct previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 2];
            assert.equal(lastToken.type, 'Punctuator');
            assert.equal(lastToken.value, '}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'case');
            assert.equal(previousToken.type, 'Keyword');
            assert.equal(previousToken.value, 'case');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '{');
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, '{');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ':');
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, ':');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '(');
            assert.equal(previousToken.type, 'Punctuator');
            assert.equal(previousToken.value, '(');
        });

        it('should not find any token if it does not exist', function() {
            var lastToken = tokens[tokens.length - 2];
            assert.equal(lastToken.type, 'Punctuator');
            assert.equal(lastToken.value, '}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'if');
            assert.equal(previousToken, undefined);

            previousToken = file.findPrevToken(lastToken, 'Numeric');
            assert.equal(previousToken, undefined);

            previousToken = file.findPrevToken(lastToken, 'Boolean');
            assert.equal(previousToken, undefined);

            previousToken = file.findPrevToken(lastToken, 'Null');
            assert.equal(previousToken, undefined);
        });

        it('should find prev token', function() {
            file = createJsFile('if (true);');

            var trueToken = file.getTokens()[2];
            assert.equal(trueToken.type, 'Boolean');
            assert.equal(trueToken.value, 'true');

            var ifToken = file.findPrevToken(trueToken, 'Keyword');
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            ifToken = file.findPrevToken(trueToken, 'Keyword', 'if');
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');
        });
    });

    describe('findNextOperatorToken', function() {
        it('should should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], '=');
            assert.equal(token.type, 'Punctuator');
            assert.equal(token.value, '=');
            assert.equal(token.range[0], 2);
        });

        it('should should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], 'instanceof');
            assert.equal(token.type, 'Keyword');
            assert.equal(token.value, 'instanceof');
            assert.equal(token.range[0], 2);
        });

        it('should should return undefined for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findNextOperatorToken(file.getTokens()[0], '-');
            assert(token === undefined);
        });
    });

    describe('findPrevOperatorToken', function() {
        it('should should return next punctuator', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTokens()[2], '=');
            assert.equal(token.type, 'Punctuator');
            assert.equal(token.value, '=');
            assert.equal(token.range[0], 2);
        });

        it('should should return next operator-keyword', function() {
            var file = createJsFile('x instanceof y;');
            var token = file.findPrevOperatorToken(file.getTokens()[2], 'instanceof');
            assert.equal(token.type, 'Keyword');
            assert.equal(token.value, 'instanceof');
            assert.equal(token.range[0], 2);
        });

        it('should should return undefined for non-found token', function() {
            var file = createJsFile('x = y;');
            var token = file.findPrevOperatorToken(file.getTokens()[2], '-');
            assert(token === undefined);
        });
    });

    describe('getTokenByRangeStart', function() {
        it('should return token for specified start position', function() {
            var file = createJsFile('if (true) { x++; }');

            var ifToken = file.getTokenByRangeStart(0);
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            var incToken = file.getTokenByRangeStart(12);
            assert.equal(incToken.type, 'Identifier');
            assert.equal(incToken.value, 'x');
        });

        it('should return undefined if token was not found', function() {
            var file = createJsFile('if (true) { x++; }');

            var token = file.getTokenByRangeStart(1);
            assert(token === undefined);
        });
    });

    describe('getTokenByRangeEnd', function() {
        it('should return token for specified end position', function() {
            var file = createJsFile('if (true) { x++; }');

            var ifToken = file.getTokenByRangeEnd(2);
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            var incToken = file.getTokenByRangeEnd(13);
            assert.equal(incToken.type, 'Identifier');
            assert.equal(incToken.value, 'x');
        });

        it('should return undefined if token was not found', function() {
            var file = createJsFile('if (true) { x++; }');

            var token = file.getTokenByRangeEnd(3);
            assert(token === undefined);
        });
    });

    describe('getFirstNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstNodeToken(file.getNodesByType('IfStatement')[0]);
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            var incToken = file.getFirstNodeToken(file.getNodesByType('UpdateExpression')[0]);
            assert.equal(incToken.type, 'Identifier');
            assert.equal(incToken.value, 'x');
        });
    });

    describe('getLastNodeToken', function() {
        it('should return token for specified node', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getLastNodeToken(file.getNodesByType('IfStatement')[0]);
            assert.equal(ifToken.type, 'Punctuator');
            assert.equal(ifToken.value, '}');

            var incToken = file.getLastNodeToken(file.getNodesByType('UpdateExpression')[0]);
            assert.equal(incToken.type, 'Punctuator');
            assert.equal(incToken.value, '++');
        });
    });

    describe('getFirstToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var ifToken = file.getFirstToken();
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');
        });
    });

    describe('getLastToken', function() {
        it('should return token for specified file', function() {
            var file = createJsFile('if (true) { while (true) x++; }');

            var EOFToken = file.getLastToken();
            assert.equal(EOFToken.type, 'EOF');
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
                assert.equal(nodes.length, 0);
            });

            it('should return empty array if the argument.range is invalid', function() {
                var nodes = file.getNodesByFirstToken({});
                assert.equal(nodes.length, 0);
            });

            it('should return empty array if the argument.range[0] is invalid', function() {
                var nodes = file.getNodesByFirstToken({
                    range: {}
                });
                assert.equal(nodes.length, 0);
            });
        });

        describe('empty progam', function() {
            var file;
            beforeEach(function() {
                file = createJsFile('');
            });

            it('should return 1 node of type Program when provided the first token', function() {
                var token = file.getFirstToken();
                var nodes = file.getNodesByFirstToken(token);
                assert.equal(nodes.length, 1);
                assert.equal(nodes[0].type, 'Program');
            });
        });

        describe('normal progam', function() {
            var file;
            beforeEach(function() {
                file = createJsFile('var x;\ndo {\n\tx++;\n} while (x < 10);');
            });

            it('should return nodes when supplied with a token that is the start of a node', function() {
                var token = file.getFirstToken();
                var nodes = file.getNodesByFirstToken(token);
                assert.equal(nodes.length, 2);
                assert.equal(nodes[0].type, 'Program');
                assert.equal(nodes[1].type, 'VariableDeclaration');
            });

            it('should return an empty array when supplied with a token that is not the start of a node', function() {
                var token = file.getFirstToken();
                var nextToken = file.findNextToken(token, 'Keyword', 'while');
                var nodes = file.getNodesByFirstToken(nextToken);
                assert.equal(nodes.length, 0);
            });
        });
    });

    describe('getNodesByType', function() {
        it('should return nodes using specified type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Identifier');
            assert.equal(nodes.length, 2);
            assert.equal(nodes[0].type, 'Identifier');
            assert.equal(nodes[0].name, 'x');
            assert.equal(nodes[1].type, 'Identifier');
            assert.equal(nodes[1].name, 'y');
        });

        it('should return empty array for non-existing type', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType('Literal');
            assert.equal(nodes.length, 0);
        });

        it('should accept array as an argument', function() {
            var nodes = createJsFile('x += 1;').getNodesByType(['Identifier', 'Literal']);
            assert.equal(nodes.length, 2);
            assert.equal(nodes[0].type, 'Identifier');
            assert.equal(nodes[0].name, 'x');
            assert.equal(nodes[1].type, 'Literal');
            assert.equal(nodes[1].value, 1);
        });

        it('should return empty array for non-existing type array', function() {
            var nodes = createJsFile('x++;y++;').getNodesByType(['Literal', 'BinaryExpression']);
            assert.equal(nodes.length, 0);
        });
    });

    describe('getFirstLineToken', function() {
        it('should return first line token', function() {
            var file = createJsFile('x += 1;\ny += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var yToken = file.getFirstTokenOnLine(2);
            assert.equal(yToken.type, 'Identifier');
            assert.equal(yToken.value, 'y');
        });

        it('should return first line token if token is indented', function() {
            var file = createJsFile('\t\tx += 1;\n\t\ty += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var yToken = file.getFirstTokenOnLine(2);
            assert.equal(yToken.type, 'Identifier');
            assert.equal(yToken.value, 'y');
        });

        it('should return undefined if no token was found', function() {
            var file = createJsFile('\t\tx += 1;\n\n');
            var yToken = file.getFirstTokenOnLine(2);
            assert.equal(yToken, undefined);
        });

        it('should return undefined if only comment was found', function() {
            var file = createJsFile('\t\tx += 1;\n/*123*/\n');
            var yToken = file.getFirstTokenOnLine(2);
            assert.equal(yToken, undefined);
        });

        it('should return first line token ignoring comments', function() {
            var file = createJsFile('\t/* 123 */\tx += 1;\n\t/* 321 */\ty += 4;');
            var xToken = file.getFirstTokenOnLine(1);
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var yToken = file.getFirstTokenOnLine(2);
            assert.equal(yToken.type, 'Identifier');
            assert.equal(yToken.value, 'y');
        });

        it('should return first line token including comments', function() {
            var file = createJsFile('\t/*123*/\tx += 1;\n\t/*321*/\ty += 4;');
            var commentToken1 = file.getFirstTokenOnLine(1, {includeComments: true});
            assert(commentToken1.isComment);
            assert.equal(commentToken1.type, 'Block');
            assert.equal(commentToken1.value, '123');
            var commentToken2 = file.getFirstTokenOnLine(2, {includeComments: true});
            assert(commentToken2.isComment);
            assert.equal(commentToken2.type, 'Block');
            assert.equal(commentToken2.value, '321');
        });

        it('should return undefined if no token was found including comments', function() {
            var file = createJsFile('\t\tx += 1;\n\n');
            var yToken = file.getFirstTokenOnLine(2, {includeComments: true});
            assert.equal(yToken, undefined);
        });
    });

    describe('getLastLineToken', function() {
        it('should return last line token', function() {
            var file = createJsFile('x = 1;\nif (x) {}\n');
            var xToken = file.getLastTokenOnLine(1);
            assert.equal(xToken.type, 'Punctuator');
            assert.equal(xToken.value, ';');
            var ifToken = file.getLastTokenOnLine(2);
            assert.equal(ifToken.type, 'Punctuator');
            assert.equal(ifToken.value, '}');
        });

        it('should return undefined if no token was found', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1);
            assert.equal(noToken, undefined);
        });

        it('should return undefined if only comment was found', function() {
            var file = createJsFile('\t\tx += 1;\n/*123*/\n');
            var noToken = file.getLastTokenOnLine(2);
            assert.equal(noToken, undefined);
        });

        it('should return last line token ignoring comments', function() {
            var file = createJsFile('x = 1; /* 321 */\n');
            var xToken = file.getLastTokenOnLine(1);
            assert.equal(xToken.type, 'Punctuator');
            assert.equal(xToken.value, ';');
        });

        it('should return last line token including comments', function() {
            var file = createJsFile('x = 1; /*123*/\n');
            var commentToken = file.getLastTokenOnLine(1, {includeComments: true});
            assert(commentToken.isComment);
            assert.equal(commentToken.type, 'Block');
            assert.equal(commentToken.value, '123');
        });

        it('should return undefined if no token was found including comments', function() {
            var file = createJsFile('\nx = 1;');
            var noToken = file.getLastTokenOnLine(1, {includeComments: true});
            assert.equal(noToken, undefined);
        });
    });

    describe('iterate', function() {
        it('should iterate all nodes in the document', function() {
            var file = createJsFile('x++;');

            var spy = sinon.spy();
            file.iterate(spy);

            assert.equal(spy.callCount, 4);

            assert.equal(spy.getCall(0).args[0].type, 'Program');
            assert.equal(spy.getCall(1).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(2).args[0].type, 'UpdateExpression');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        });

        it('should iterate nested nodes', function() {
            var file = createJsFile('x = (5 + 4) && (3 + 1);');

            var spy = sinon.spy();
            file.iterate(spy, file.getNodesByType('LogicalExpression')[0].left);

            assert.equal(spy.callCount, 3);
            assert.equal(spy.getCall(0).args[0].type, 'BinaryExpression');
            assert.equal(spy.getCall(1).args[0].type, 'Literal');
            assert.equal(spy.getCall(1).args[0].value, 5);
            assert.equal(spy.getCall(2).args[0].type, 'Literal');
            assert.equal(spy.getCall(2).args[0].value, 4);
        });
    });

    describe('iterateNodesByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('Identifier', spy);
            assert.equal(spy.callCount, 2);
            assert.equal(spy.getCall(0).args[0].type, 'Identifier');
            assert.equal(spy.getCall(0).args[0].name, 'x');
            assert.equal(spy.getCall(1).args[0].type, 'Identifier');
            assert.equal(spy.getCall(1).args[0].name, 'y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType('Literal', spy);
            assert(!spy.called);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateNodesByType(['Identifier', 'Literal'], spy);
            assert.equal(spy.callCount, 2);
            assert.equal(spy.getCall(0).args[0].type, 'Identifier');
            assert.equal(spy.getCall(0).args[0].name, 'x');
            assert.equal(spy.getCall(1).args[0].type, 'Literal');
            assert.equal(spy.getCall(1).args[0].value, 1);
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateNodesByType(['Literal', 'BinaryExpression'], spy);
            assert(!spy.called);
        });
    });

    describe('iterateTokensByType', function() {
        it('should apply callback using specified type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Identifier', spy);
            assert.equal(spy.callCount, 2);
            assert.equal(spy.getCall(0).args[0].type, 'Identifier');
            assert.equal(spy.getCall(0).args[0].value, 'x');
            assert.equal(spy.getCall(1).args[0].type, 'Identifier');
            assert.equal(spy.getCall(1).args[0].value, 'y');
        });

        it('should not apply callback for non-existing type', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType('Boolean', spy);
            assert(!spy.called);
        });

        it('should apply callback for line comments', function() {
            var spy = sinon.spy();
            createJsFile('//foo').iterateTokensByType('Line', spy);
            assert(spy.calledOnce);
        });

        it('should apply callback for block comments', function() {
            var spy = sinon.spy();
            createJsFile('/*foo*/').iterateTokensByType('Block', spy);
            assert(spy.calledOnce);
        });

        it('should accept array as an argument', function() {
            var spy = sinon.spy();
            createJsFile('x += 1;').iterateTokensByType(['Identifier', 'Numeric'], spy);
            assert.equal(spy.callCount, 2);
            assert.equal(spy.getCall(0).args[0].type, 'Identifier');
            assert.equal(spy.getCall(0).args[0].value, 'x');
            assert.equal(spy.getCall(1).args[0].type, 'Numeric');
            assert.equal(spy.getCall(1).args[0].value, '1');
        });

        it('should not apply callback for non-existing type array', function() {
            var spy = sinon.spy();
            createJsFile('x++;y++;').iterateTokensByType(['Boolean', 'Numeric'], spy);
            assert(!spy.called);
        });
    });

    describe('getTree', function() {
        it('should return empty token tree for non-existing esprima-tree', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            assert.equal(typeof file.getTree(), 'object');
            assert(file.getTree() !== null);
        });
    });

    describe('getSource', function() {
        it('should return specified source code', function() {
            var sources = 'var x = 1;\nvar y = 2;';
            var file = createJsFile(sources);
            assert.equal(file.getSource(), sources);
        });
    });

    describe('getTokens', function() {
        it('should return EOF for empty string', function() {
            var tokens = createJsFile('').getTokens();
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'EOF');
        });

        it('should end with EOF', function() {
            var tokens = createJsFile('if(true) {\nvar a = 2;\n}').getTokens();
            assert.equal(tokens[tokens.length - 1].type, 'EOF');
        });

        it('should include comments', function() {
            var tokens = createJsFile('/* foo */').getTokens();
            assert.equal(tokens[0].type, 'Block');
        });
    });

    describe('getDialect', function() {
        var sources = 'var x = 1;\nvar y = 2;';

        it('should return es5 with no options specified', function() {
            var file = createJsFile(sources);
            assert.equal(file.getDialect(), 'es5');
        });

        it('should return es6 when es6 is specified as true', function() {
            var file = createJsFile(sources, {es6: true});
            assert.equal(file.getDialect(), 'es6');
        });

        it('should return es5 when es6 is specified as false', function() {
            var file = createJsFile(sources, {es6: false});
            assert.equal(file.getDialect(), 'es5');
        });

        it('should return es3 when es3 is specified as true', function() {
            var file = createJsFile(sources, {es3: true});
            assert.equal(file.getDialect(), 'es3');
        });

        it('should return es5 when es3 is specified as false', function() {
            var file = createJsFile(sources, {es3: false});
            assert.equal(file.getDialect(), 'es5');
        });

        it('should return es6 when es3 and es6 are both specified as true', function() {
            var file = createJsFile(sources, {es3: true, es6: true});
            assert.equal(file.getDialect(), 'es6');
        });
    });

    describe('getLines', function() {
        it('should return specified source code lines', function() {
            var sources = ['var x = 1;', 'var y = 2;'];
            var file = createJsFile(sources.join('\n'));
            assert.equal(file.getLines().length, 2);
            assert.equal(file.getLines()[0], sources[0]);
            assert.equal(file.getLines()[1], sources[1]);
        });

        it('should accept all line endings', function() {
            var lineEndings = ['\r\n', '\r', '\n'];

            lineEndings.forEach(function(lineEnding) {
                var sources = ['var x = 1;', 'var y = 2;'];
                var file = createJsFile(sources.join(lineEnding));
                assert.equal(file.getLines().length, 2);
                assert.equal(file.getLines()[0], sources[0]);
                assert.equal(file.getLines()[1], sources[1]);
            });
        });
    });

    describe('getLinesWithCommentsRemoved', function() {
        it('should strip line comments', function() {
            var source = 'a++; //comment\n//comment';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            assert.equal(lines.length, 2);
            assert.equal(lines[0], 'a++; ');
            assert.equal(lines[1], '');
        });

        it('should strip single-line block comments', function() {
            var source = 'a++;/*comment*/b++;\n/*comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            assert.equal(lines.length, 2);
            assert.equal(lines[0], 'a++;b++;');
            assert.equal(lines[1], '');
        });

        it('should strip multi-line block comments', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            assert.equal(lines.length, 3);
            assert.equal(lines[0], 'a++;');
            assert.equal(lines[1], '');
            assert.equal(lines[2], '');
        });

        it('should strip an multi-line block comments with trailing tokens', function() {
            var source = 'a++;/*comment\nmore comment\nmore comment*/b++;';
            var file = createJsFile(source);
            var lines = file.getLinesWithCommentsRemoved();
            assert.equal(lines.length, 3);
            assert.equal(lines[0], 'a++;');
            assert.equal(lines[1], '');
            assert.equal(lines[2], 'b++;');
        });

        it('should preserve comment order', function() {
            var source = '//comment1\n//comment2';
            var file = createJsFile(source);

            file.getLinesWithCommentsRemoved();
            assert.equal(file.getComments()[0].value, 'comment1');
            assert.equal(file.getComments()[1].value, 'comment2');
        });
    });

    describe('getFilename', function() {
        it('should return given filename', function() {
            var file = new JsFile({
                filename: 'example.js',
                source: 'Hello\nWorld',
                esprima: esprima
            });
            assert.equal(file.getFilename(), 'example.js');
        });
    });

    describe('render', function() {
        var relativeDirPath = '../data/render';
        var absDirPath = __dirname + '/' + relativeDirPath;
        fs.readdirSync(absDirPath).forEach(function(filename) {
            it('file ' + relativeDirPath + '/' + filename + ' should be rendered correctly', function() {
                var source = fs.readFileSync(absDirPath + '/' + filename, 'utf8');
                var file = createBabelJsFile(source);
                assert.equal(file.render(), source);
            });
        });
    });

    describe('getLineBreaks', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            assert.deepEqual(file.getLineBreaks(), ['\n']);
        });

        it('should return empty array for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello', esprima: esprima});
            assert.deepEqual(file.getLineBreaks(), []);
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld', esprima: esprima});
            assert.deepEqual(file.getLineBreaks(), ['\r']);
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld', esprima: esprima});
            assert.deepEqual(file.getLineBreaks(), ['\r\n']);
        });
    });

    describe('getLineBreakStyle', function() {
        it('should return \\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld', esprima: esprima});
            assert.equal(file.getLineBreakStyle(), '\n');
        });

        it('should return \\r', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\rWorld', esprima: esprima});
            assert.equal(file.getLineBreakStyle(), '\r');
        });

        it('should return \\r\\n', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\r\nWorld', esprima: esprima});
            assert.equal(file.getLineBreakStyle(), '\r\n');
        });

        it('should return \\n for single line file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello', esprima: esprima});
            assert.equal(file.getLineBreakStyle(), '\n');
        });

        it('should return first line break for mixed file', function() {
            var file = new JsFile({filename: 'example.js', source: 'Hello\nWorld\r\n!', esprima: esprima});
            assert.equal(file.getLineBreakStyle(), file.getLineBreaks()[0]);
        });
    });

    describe('getNextToken', function() {
        it('should return next token', function() {
            var file = createJsFile('x++');
            var xToken = file.getTokens()[0];
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var nextToken = file.getNextToken(xToken);
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '++');
        });

        it('should return EOF token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var nextToken = file.getNextToken(xToken);
            assert.equal(nextToken.type, 'EOF');
            assert.equal(nextToken.value, '');
        });

        it('should return undefined for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            var nextToken = file.getNextToken(file.getNextToken(xToken));
            assert.equal(nextToken, undefined);
        });

        it('should ignore comments', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTokens()[0];
            var nextToken = file.getNextToken(xToken, {includeComments: false});
            assert.equal(nextToken.type, 'EOF');
            assert.equal(nextToken.value, '');
        });

        it('should return next comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getTokens()[0];
            var nextToken = file.getNextToken(xToken, {includeComments: true});
            assert.equal(nextToken.type, 'Block');
        });

        it('should return EOF next to comment', function() {
            var file = createJsFile('x /*123*/');
            var xToken = file.getComments()[0];
            var nextToken = file.getNextToken(xToken, {includeComments: true});
            assert.equal(nextToken.type, 'EOF');
        });
    });

    describe('getPrevToken', function() {
        it('should return previous token', function() {
            var file = createJsFile('++x');
            var xToken = file.getTokens()[1];
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var nextToken = file.getPrevToken(xToken);
            assert.equal(nextToken.type, 'Punctuator');
            assert.equal(nextToken.value, '++');
        });

        it('should return undefined for out-of-range token', function() {
            var file = createJsFile('x');
            var xToken = file.getTokens()[0];
            assert.equal(xToken.type, 'Identifier');
            assert.equal(xToken.value, 'x');
            var nextToken = file.getPrevToken(xToken);
            assert.equal(nextToken, undefined);
        });

        it('should ignore comments', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTokens()[1];
            var nextToken = file.getPrevToken(xToken, {includeComments: false});
            assert.equal(nextToken, undefined);
        });

        it('should return previous comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getTokens()[1];
            var nextToken = file.getPrevToken(xToken, {includeComments: true});
            assert.equal(nextToken.type, 'Block');
        });

        it('should return undefined next to comment', function() {
            var file = createJsFile('/*123*/ x');
            var xToken = file.getComments()[0];
            var nextToken = file.getPrevToken(xToken, {includeComments: true});
            assert.equal(nextToken, undefined);
        });
    });

    describe('iterateTokensByTypeAndValue', function() {
        it('should match specified type', function() {
            var file = createJsFile('var x = 1 + 1; /*1*/ //1');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', '1', spy);

            assert.equal(spy.callCount, 2);

            assert.equal(spy.getCall(0).args[0].type, 'Numeric');
            assert.equal(spy.getCall(0).args[0].value, '1');
            assert.equal(spy.getCall(1).args[0].type, 'Numeric');
            assert.equal(spy.getCall(1).args[0].value, '1');
        });

        it('should accept value list', function() {
            var file = createJsFile('var x = 1 + 2 + "2"; /*1*/ //2');

            var spy = sinon.spy();
            file.iterateTokensByTypeAndValue('Numeric', ['1', '2'], spy);

            assert.equal(spy.callCount, 2);

            assert.equal(spy.getCall(0).args[0].type, 'Numeric');
            assert.equal(spy.getCall(0).args[0].value, '1');
            assert.equal(spy.getCall(1).args[0].type, 'Numeric');
            assert.equal(spy.getCall(1).args[0].value, '2');
        });
    });
});
