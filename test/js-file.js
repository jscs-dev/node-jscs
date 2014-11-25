var assert = require('assert');
var esprima = require('esprima');
var harmonyEsprima = require('esprima-harmony-jscs');
var JsFile = require('../lib/js-file');
var sinon = require('sinon');

describe('modules/js-file', function() {
    describe('constructor', function() {

        it('should accept empty token tree', function() {
            var file = new JsFile(null, 'Hello\nWorld', null);
            assert(Array.isArray(file.getTokens()));
            assert.equal(file.getTokens().length, 0);
        });

        // Testing esprima token fix
        // https://code.google.com/p/esprima/issues/detail?id=481
        describe('Keywords -> Identifier fixing', function() {
            it('should affect object keys tokens', function() {
                var str = '({' +
                    'break: true, export: true, return: true, case: true, for: true, switch: true, comment: true,' +
                    'function: true, this: true, continue: true, if: true, typeof: true, default: true, import: true,' +
                    'var: true, delete: true, in: true, void: true, do: true, label: true, while: true, else: true,' +
                    'new: true, with: true, catch: true, try: true, finally: true' +
                    '})';
                var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));
                file.getTokens().forEach(function(token) {
                    assert(token.type !== 'Keyword');
                });
            });

            it('should affect member access tokens', function() {
                var str = 'o.break(); o.export(); o.return(); o.case(); o.for(); o.switch(); o.comment();' +
                    'o.function(); o.this(); o.continue(); o.if(); o.typeof(); o.default(); o.import();' +
                    'o.var(); o.delete(); o.in(); o.void(); o.do(); o.label(); o.while(); o.else();' +
                    'o.new(); o.with(); o.catch(); o.try(); o.finally();';
                var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));
                file.getTokens().forEach(function(token) {
                    assert(token.type !== 'Keyword');
                });
            });

            it('should not affect valid nested constructions', function() {
                var str = 'if (true) { if (false); }';
                var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

                file.getTokens().forEach(function(token) {
                    if (token.value === 'if') {
                        assert(token.type === 'Keyword');
                    }
                });
            });
        });
    });

    describe('iterateNodesByType', function() {
        it('should handle ES6 export keyword', function() {
            var str = 'export function foo() { var a = "b"; };';
            var file = new JsFile(null, str, harmonyEsprima.parse(str, {loc: true, range: true, tokens: true}));
            var spy = sinon.spy();
            file.iterateNodesByType('VariableDeclaration', spy);
            assert(spy.calledOnce);
        });
    });

    describe('iterateTokenByValue',  function() {
        it('should find token by value', function() {
            var str = 'if (true);';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            file.iterateTokenByValue(')', function(token, index, tokens) {
                assert(token.value === ')');
                assert(index === 3);
                assert(Array.isArray(tokens));
            });
        });

        it('should find tokens by value', function() {
            var str = 'if (true);';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            file.iterateTokenByValue([')', '('], function(token, index, tokens) {
                assert(token.value === ')' || token.value === '(');
                assert(index === 3 || index === 1);
                assert(Array.isArray(tokens));
            });
        });

        it('should not find string value', function() {
            var str = '"("';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var spy = sinon.spy();
            file.iterateTokenByValue('(', spy);
            assert(!spy.calledOnce);
        });

        it('should not take only own propeties', function() {
            var str = 'test.toString';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var spy = sinon.spy();
            file.iterateTokenByValue('(', spy);
            assert(!spy.calledOnce);
        });
    });

    describe('getNodeByRange', function() {
        it('should get node by range for function declaration', function() {
            var str = 'function foo(a,b) {}';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            assert(file.getNodeByRange(16).type === 'FunctionDeclaration');
        });

        it('should get node by range for function expression', function() {
            var str = 'foo(a,b)';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            assert(file.getNodeByRange(7).type === 'CallExpression');
        });

        it('should get node by range for function expression inside "if" statement', function() {
            var str = 'if(true){foo(a,b)}';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            assert(file.getNodeByRange(16).type === 'CallExpression');
        });

        it('should get node by range for function expression with additional parentheses', function() {
            var str = 'foo(1,(2))';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            assert(file.getNodeByRange(9).type === 'CallExpression');
        });

        it('should return empty object', function() {
            var str = 'foo(1,2)';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            assert(file.getNodeByRange(20).type === undefined);
        });

        it('should not throw on regexp', function() {
            var str = '/^/';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            try {
                file.getNodeByRange(1);
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });

    describe('findNextToken and findPrevToken methods', function() {
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));
        var tokens = file.getTokens();

        it('should find the first next token when only the type is specified', function() {
            var switchToken = file.getTokens()[0];
            assert(switchToken.type === 'Keyword');
            assert(switchToken.value === 'switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier');
            assert(nextToken.type === 'Identifier');
            assert(nextToken.value === 'varName');

            nextToken = file.findNextToken(switchToken, 'Keyword');
            assert(nextToken.type === 'Keyword');
            assert(nextToken.value === 'case');

            nextToken = file.findNextToken(switchToken, 'Punctuator');
            assert(nextToken.type === 'Punctuator');
            assert(nextToken.value === '(');
        });

        it('should find the first next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            assert(switchToken.type === 'Keyword');
            assert(switchToken.value === 'switch');

            var nextToken = file.findNextToken(switchToken, 'Identifier', 'varName');
            assert(nextToken.type === 'Identifier');
            assert(nextToken.value === 'varName');

            nextToken = file.findNextToken(switchToken, 'Keyword', 'case');
            assert(nextToken.type === 'Keyword');
            assert(nextToken.value === 'case');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '(');
            assert(nextToken.type === 'Punctuator');
            assert(nextToken.value === '(');
        });

        it('should find the correct next token when both type and value are specified', function() {
            var switchToken = file.getTokens()[0];
            assert(switchToken.type === 'Keyword');
            assert(switchToken.value === 'switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'break');
            assert(nextToken.type === 'Keyword');
            assert(nextToken.value === 'break');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '{');
            assert(nextToken.type === 'Punctuator');
            assert(nextToken.value === '{');

            nextToken = file.findNextToken(switchToken, 'Punctuator', ':');
            assert(nextToken.type === 'Punctuator');
            assert(nextToken.value === ':');

            nextToken = file.findNextToken(switchToken, 'Punctuator', '}');
            assert(nextToken.type === 'Punctuator');
            assert(nextToken.value === '}');
        });

        it('should not find any token if it does not exist', function() {
            var switchToken = file.getTokens()[0];
            assert(switchToken.type === 'Keyword');
            assert(switchToken.value === 'switch');

            var nextToken = file.findNextToken(switchToken, 'Keyword', 'if');
            assert(nextToken === undefined);

            nextToken = file.findNextToken(switchToken, 'Numeric');
            assert(nextToken === undefined);

            nextToken = file.findNextToken(switchToken, 'Boolean');
            assert(nextToken === undefined);

            nextToken = file.findNextToken(switchToken, 'Null');
            assert(nextToken === undefined);
        });

        it('should find the first previous token when only the type is specified', function() {
            var lastToken = tokens[tokens.length - 1];
            assert(lastToken.type === 'Punctuator');
            assert(lastToken.value === '}');

            var previousToken = file.findPrevToken(lastToken, 'Identifier');
            assert(previousToken.type === 'Identifier');
            assert(previousToken.value === 'a');

            previousToken = file.findPrevToken(lastToken, 'Keyword');
            assert(previousToken.type === 'Keyword');
            assert(previousToken.value === 'break');

            previousToken = file.findPrevToken(lastToken, 'Punctuator');
            assert(previousToken.type === 'Punctuator');
            assert(previousToken.value === ';');
        });

        it('should find the first previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 1];
            assert(lastToken.type === 'Punctuator');
            assert(lastToken.value === '}');

            var previousToken = file.findPrevToken(lastToken, 'Identifier', 'a');
            assert(previousToken.type === 'Identifier');
            assert(previousToken.value === 'a');

            previousToken = file.findPrevToken(lastToken, 'Keyword', 'break');
            assert(previousToken.type === 'Keyword');
            assert(previousToken.value === 'break');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ';');
            assert(previousToken.type === 'Punctuator');
            assert(previousToken.value === ';');
        });

        it('should find the correct previous token when both type and value are specified', function() {
            var lastToken = tokens[tokens.length - 1];
            assert(lastToken.type === 'Punctuator');
            assert(lastToken.value === '}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'case');
            assert(previousToken.type === 'Keyword');
            assert(previousToken.value === 'case');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '{');
            assert(previousToken.type === 'Punctuator');
            assert(previousToken.value === '{');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', ':');
            assert(previousToken.type === 'Punctuator');
            assert(previousToken.value === ':');

            previousToken = file.findPrevToken(lastToken, 'Punctuator', '(');
            assert(previousToken.type === 'Punctuator');
            assert(previousToken.value === '(');
        });

        it('should not find any token if it does not exist', function() {
            var lastToken = tokens[tokens.length - 1];
            assert(lastToken.type === 'Punctuator');
            assert(lastToken.value === '}');

            var previousToken = file.findPrevToken(lastToken, 'Keyword', 'if');
            assert(previousToken === undefined);

            previousToken = file.findPrevToken(lastToken, 'Numeric');
            assert(previousToken === undefined);

            previousToken = file.findPrevToken(lastToken, 'Boolean');
            assert(previousToken === undefined);

            previousToken = file.findPrevToken(lastToken, 'Null');
            assert(previousToken === undefined);
        });

        it('should find prev token', function() {
            str = 'if (true);';
            file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var trueToken = file.getTokens()[2];
            assert(trueToken.type === 'Boolean');
            assert(trueToken.value === 'true');

            var ifToken = file.findPrevToken(trueToken, 'Keyword');
            assert(ifToken.type === 'Keyword');
            assert(ifToken.value === 'if');

            ifToken = file.findPrevToken(trueToken, 'Keyword', 'if');
            assert(ifToken.type === 'Keyword');
            assert(ifToken.value === 'if');
        });

        it('should not throw on regexp', function() {
            var str = '/^/';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            try {
                file.getNodeByRange(1);
                assert(true);
            } catch (e) {
                assert(false);
            }
        });
    });

    function createJsFile(sources) {
        return new JsFile(
            'example.js',
            sources,
            esprima.parse(sources, {loc: true, range: true, comment: true, tokens: true})
        );
    }

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
            var str = 'if (true) { x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var ifToken = file.getTokenByRangeStart(0);
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            var incToken = file.getTokenByRangeStart(12);
            assert.equal(incToken.type, 'Identifier');
            assert.equal(incToken.value, 'x');
        });

        it('should return undefined if token was not found', function() {
            var str = 'if (true) { x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var token = file.getTokenByRangeStart(1);
            assert(token === undefined);
        });
    });

    describe('getTokenByRangeEnd', function() {
        it('should return token for specified end position', function() {
            var str = 'if (true) { x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var ifToken = file.getTokenByRangeEnd(2);
            assert.equal(ifToken.type, 'Keyword');
            assert.equal(ifToken.value, 'if');

            var incToken = file.getTokenByRangeEnd(13);
            assert.equal(incToken.type, 'Identifier');
            assert.equal(incToken.value, 'x');
        });

        it('should return undefined if token was not found', function() {
            var str = 'if (true) { x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var token = file.getTokenByRangeEnd(3);
            assert(token === undefined);
        });
    });

    describe('getFirstNodeToken', function() {
        it('should return token for specified node', function() {
            var str = 'if (true) { while (true) x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
            var str = 'if (true) { while (true) x++; }';
            var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

            var ifToken = file.getLastNodeToken(file.getNodesByType('IfStatement')[0]);
            assert.equal(ifToken.type, 'Punctuator');
            assert.equal(ifToken.value, '}');

            var incToken = file.getLastNodeToken(file.getNodesByType('UpdateExpression')[0]);
            assert.equal(incToken.type, 'Punctuator');
            assert.equal(incToken.value, '++');
        });
    });
});
