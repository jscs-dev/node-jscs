var assert = require('assert');
var esprima = require('esprima');
var JsFile = require('../lib/js-file');

describe('modules/js-file', function() {
    it('should fix token array for object keys', function() {
        var str = '({ for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for object keys with multiple keys', function() {
        var str = '({ test: 1, for: 42 })';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.getTokens().forEach(function(token) {
            assert(token.type !== 'Keyword');
        });
    });

    it('should fix token array for method calls', function() {
        var str = 'promise.catch()';
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

    it('should return token for specified node', function() {
        var str = 'if (true) { while (true) x++; }';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var ifToken = file.getFirstNodeToken(file.getNodesByType('IfStatement')[0]);
        assert(ifToken.type === 'Keyword');
        assert(ifToken.value === 'if');

        var incToken = file.getFirstNodeToken(file.getNodesByType('UpdateExpression')[0]);
        assert(incToken.type === 'Identifier');
        assert(incToken.value === 'x');
    });

    it('should return token for specified position', function() {
        var str = 'if (true) { x++; }';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var ifToken = file.getTokenByRangeStart(0);
        assert(ifToken.type === 'Keyword');
        assert(ifToken.value === 'if');

        var incToken = file.getTokenByRangeStart(12);
        assert(incToken.type === 'Identifier');
        assert(incToken.value === 'x');
    });

    it('should return next token', function() {
        var str = 'if (true);';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var ifToken = file.getTokens()[0];
        assert(ifToken.type === 'Keyword');
        assert(ifToken.value === 'if');

        var parenthesisToken = file.getNextToken(ifToken);
        assert(parenthesisToken.type === 'Punctuator');
        assert(parenthesisToken.value === '(');

        var trueToken = file.getNextToken(parenthesisToken);
        assert(trueToken.type === 'Boolean');
        assert(trueToken.value === 'true');
    });

    it('should return prev token', function() {
        var str = 'if (true);';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var trueToken = file.getTokens()[2];
        assert(trueToken.type === 'Boolean');
        assert(trueToken.value === 'true');

        var parenthesisToken = file.getPrevToken(trueToken);
        assert(parenthesisToken.type === 'Punctuator');
        assert(parenthesisToken.value === '(');

        var ifToken = file.getPrevToken(parenthesisToken);
        assert(ifToken.type === 'Keyword');
        assert(ifToken.value === 'if');
    });

    it('should find next token', function() {
        var str = 'if (true);';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var ifToken = file.getTokens()[0];
        assert(ifToken.type === 'Keyword');
        assert(ifToken.value === 'if');

        var trueToken = file.findNextToken(ifToken, 'Boolean');
        assert(trueToken.type === 'Boolean');
        assert(trueToken.value === 'true');

        trueToken = file.findNextToken(ifToken, 'Boolean', 'true');
        assert(trueToken.type === 'Boolean');
        assert(trueToken.value === 'true');
    });

    it('should find prev token', function() {
        var str = 'if (true);';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
});
