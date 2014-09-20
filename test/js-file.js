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

    it('should find the first next token when only the type is specified', function() {
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var tokens = file.getTokens();

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var tokens = file.getTokens();

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var tokens = file.getTokens();

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
        var str = 'switch(varName){case"yes":a++;break;}';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        var tokens = file.getTokens();

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

    it('should not find string value', function() {
        var str = '"("';
        var file = new JsFile(null, str, esprima.parse(str, {loc: true, range: true, tokens: true}));

        file.iterateTokenByValue('(', function(token, index, tokens) {
            assert(false);
        });
    });
});
