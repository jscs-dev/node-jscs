var TokenCategorizer = require('../../lib/token-categorizer');
var assert = require('assert');
var JsFile = require('../../lib/js-file');
var esprima = require('esprima');

describe('token-categorizer', function() {

    function createJsFile(source, customEsprima) {
        return new JsFile({
            filename: 'example.js',
            source: source,
            esprima: customEsprima || esprima,
            esprimaOptions: {loc: true, range: true, comment: true, tokens: true}
        });
    }

    describe('categorizeOpenParen', function() {
        var sharedFile;
        var openParens = [];

        before(function() {
            sharedFile = createJsFile(
                '(((function(){ function f(){} ' +
                'if(new f(0)) return((f)(0, (1), ((2)))); throw(f()+(0)); })))'
            );
            sharedFile.iterateTokenByValue('(', function(token) {
                openParens.push({
                    type: TokenCategorizer.categorizeOpenParen(token, sharedFile),
                    offset: token.range[0],
                    self: token,
                    prev: sharedFile.getPrevToken(token)
                });
            });
        });

        it('should limit input to open parentheses', function() {
            var nonParen = sharedFile.getPrevToken(sharedFile.getLastToken());
            assert.throws(function() {
                    TokenCategorizer.categorizeOpenParen(nonParen, sharedFile);
                },
                /token must be/
            );
        });

        it('should recognize statement-required parenthesis', function() {
            openParens.forEach(function(openParen) {
                if ((openParen.prev || {}).value === 'if') {
                    assert.equal(openParen.type, 'Statement',
                        'source offset ' + openParen.offset);
                } else {
                    assert.notEqual(openParen.type, 'Statement',
                        'source offset ' + openParen.offset);
                }
            });

            // Check *all* parentheses-required (quasi-)statements
            var file = createJsFile(
                'try{ if(1) do while(2) for(;;3) for(p in 4) with(5) switch(6){} while(7) }' +
                'catch(x){}'
            );
            file.iterateTokenByValue('(', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeOpenParen(token, file),
                    'Statement',
                    'after ' + file.getPrevToken(token).value
                );
            });
        });

        it('should recognize function-definition parentheses', function() {
            openParens.forEach(function(openParen) {
                var prev = openParen.prev || {};
                var isFunction = prev.value === 'function' ||
                    prev.value === 'f' && sharedFile.getPrevToken(prev).value === 'function';
                if (isFunction) {
                    assert.equal(openParen.type, 'Function',
                        'source offset ' + openParen.offset);
                } else {
                    assert.notEqual(openParen.type, 'Function',
                        'source offset ' + openParen.offset);
                }
            });
        });

        it('should recognize function-call parentheses', function() {
            openParens.forEach(function(openParen) {
                var prev = openParen.prev || {};
                var isCall = (prev.value === 'f' || prev.value === ')') &&
                    sharedFile.getPrevToken(prev).value !== 'function';
                if (isCall) {
                    assert.equal(openParen.type, 'CallExpression',
                        'source offset ' + openParen.offset);
                } else {
                    assert.notEqual(openParen.type, 'CallExpression',
                        'source offset ' + openParen.offset);
                }
            });
        });

        it('should recognize all remaining cases as expressions', function() {
            openParens.forEach(function(openParen) {
                var prev = openParen.prev || { type: 'Punctuator' };
                var isExpression = prev.value === 'return' || prev.value === 'throw' ||
                    prev.type === 'Punctuator' && prev.value !== ')';
                if (isExpression) {
                    assert.equal(openParen.type, 'ParenthesizedExpression',
                        'source offset ' + openParen.offset);
                } else {
                    assert.notEqual(openParen.type, 'ParenthesizedExpression',
                        'source offset ' + openParen.offset);
                }
            });
        });
    });

    describe('categorizeCloseParen', function() {
        var sharedFile;
        var closeParens = [];

        before(function() {
            sharedFile = createJsFile(
                '(((function(){ function f(){} ' +
                'if(new f(0)+0) return((f)(0, (1), ((2)))+0); throw(f()+(0)); })))'
            );
            sharedFile.iterateTokenByValue(')', function(token) {
                closeParens.push({
                    type: TokenCategorizer.categorizeCloseParen(token, sharedFile),
                    offset: token.range[0],
                    self: token,
                    next: sharedFile.getNextToken(token)
                });
            });
        });

        it('should limit input to close parentheses', function() {
            var nonParen = sharedFile.getFirstToken();
            assert.throws(function() {
                    TokenCategorizer.categorizeCloseParen(nonParen, sharedFile);
                },
                /token must be/
            );
        });

        it('should recognize statement-required parenthesis', function() {
            closeParens.forEach(function(closeParen) {
                if (closeParen.next.value === 'return') {
                    assert.equal(closeParen.type, 'Statement',
                        'source offset ' + closeParen.offset);
                } else {
                    assert.notEqual(closeParen.type, 'Statement',
                        'source offset ' + closeParen.offset);
                }
            });

            // Check *all* parentheses-required (quasi-)statements
            var file = createJsFile(
                'try{ if(1) do while(2) for(;;3) for(p in 4) with(5) switch(6){} while(7) }' +
                'catch(x){}'
            );
            file.iterateTokenByValue(')', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeCloseParen(token, file),
                    'Statement',
                    'flavor #' + file.getPrevToken(token).value
                );
            });
        });

        it('should recognize function-definition parentheses', function() {
            closeParens.forEach(function(closeParen) {
                if (closeParen.next.value === '{') {
                    assert.equal(closeParen.type, 'Function',
                        'source offset ' + closeParen.offset);
                } else {
                    assert.notEqual(closeParen.type, 'Function',
                        'source offset ' + closeParen.offset);
                }
            });
        });

        it('should recognize function-call parentheses', function() {
            closeParens.forEach(function(closeParen) {
                if (closeParen.next.value === '+') {
                    assert.equal(closeParen.type, 'CallExpression',
                        'source offset ' + closeParen.offset);
                } else {
                    assert.notEqual(closeParen.type, 'CallExpression',
                        'source offset ' + closeParen.offset);
                }
            });
        });

        it('should correctly handle parentheses preceding EOF', function() {
            var file = createJsFile('do {} while(true)');
            file.iterateTokenByValue(')', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeCloseParen(token, file),
                    'Statement',
                    'do..while'
                );
            });

            file = createJsFile('fn()');
            file.iterateTokenByValue(')', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeCloseParen(token, file),
                    'CallExpression',
                    'function call'
                );
            });

            file = createJsFile('new Ctor()');
            file.iterateTokenByValue(')', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeCloseParen(token, file),
                    'CallExpression',
                    'constructor call'
                );
            });

            file = createJsFile('(0)');
            file.iterateTokenByValue(')', function(token) {
                assert.equal(
                    TokenCategorizer.categorizeCloseParen(token, file),
                    'ParenthesizedExpression',
                    'expression'
                );
            });
        });

        it('should recognize all remaining cases as expressions', function() {
            closeParens.forEach(function(closeParen) {
                var next = closeParen.next.value;
                if (/^[(,;)]?$/.test(next)) {
                    assert.equal(closeParen.type, 'ParenthesizedExpression',
                        'source offset ' + closeParen.offset);
                } else {
                    assert.notEqual(closeParen.type, 'ParenthesizedExpression',
                        'source offset ' + closeParen.offset);
                }
            });
        });
    });
});
