var assert = require('assert');
var esprima = require('esprima');
var harmonyEsprima = require('esprima-harmony-jscs');
var sinon = require('sinon');
var iterate = require('../lib/tree-iterator').iterate;

describe('modules/tree-iterator', function() {

    function parseJs(source) {
        return esprima.parse(source, {loc: true, range: true, comment: true, tokens: true}).body[0];
    }

    function parseHarmonyJs(source) {
        return harmonyEsprima.parse(source, {loc: true, range: true, comment: true, tokens: true}).body[0];
    }

    it('should process Program and ExpressionStatement', function() {
        var spy = sinon.spy();
        iterate(esprima.parse('1;', {loc: true, range: true, comment: true, tokens: true}), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'Program');
        assert.equal(spy.getCall(1).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
    });

    it('should process BlockStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('while (true) { 1; };'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'WhileStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Literal'); // while argument
        assert.equal(spy.getCall(1).args[0].value, true);
        assert.equal(spy.getCall(2).args[0].type, 'BlockStatement'); // while body
        assert.equal(spy.getCall(3).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(4).args[0].type, 'Literal');
        assert.equal(spy.getCall(4).args[0].value, 1);
    });

    it('should process IfStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('if (true) 1; else 2;'), spy);
        assert.equal(spy.callCount, 6);
        assert.equal(spy.getCall(0).args[0].type, 'IfStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Literal');
        assert.equal(spy.getCall(1).args[0].value, true);
        assert.equal(spy.getCall(2).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
        assert.equal(spy.getCall(4).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(5).args[0].type, 'Literal');
        assert.equal(spy.getCall(5).args[0].value, 2);
    });

    it('should process LabeledStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('x: while (true);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'LabeledStatement');
        assert.equal(spy.getCall(1).args[0].type, 'WhileStatement');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, true);
        assert.equal(spy.getCall(3).args[0].type, 'EmptyStatement');
    });

    it('should process WithStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('with (x);'), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'WithStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].type, 'EmptyStatement');
    });

    it('should process SwitchStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('switch (x) { case 1: break; default: }'), spy);
        assert.equal(spy.callCount, 6);
        assert.equal(spy.getCall(0).args[0].type, 'SwitchStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].type, 'SwitchCase');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
        assert.equal(spy.getCall(4).args[0].type, 'BreakStatement');
        assert.equal(spy.getCall(5).args[0].type, 'SwitchCase');
    });

    it('should process ReturnStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('(function() { return x; })'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'FunctionExpression');
        assert.equal(spy.getCall(2).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(3).args[0].type, 'ReturnStatement');
        assert.equal(spy.getCall(4).args[0].type, 'Identifier');
        assert.equal(spy.getCall(4).args[0].name, 'x');
    });

    it('should process TryStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('try {1;} catch (e) {2;} finally {3;}'), spy);
        assert.equal(spy.callCount, 11);
        assert.equal(spy.getCall(0).args[0].type, 'TryStatement');
        assert.equal(spy.getCall(1).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(2).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
        assert.equal(spy.getCall(4).args[0].type, 'CatchClause');
        assert.equal(spy.getCall(5).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(6).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(7).args[0].type, 'Literal');
        assert.equal(spy.getCall(7).args[0].value, 2);
        assert.equal(spy.getCall(8).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(9).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(10).args[0].type, 'Literal');
        assert.equal(spy.getCall(10).args[0].value, 3);
    });

    it('should process WhileStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('while (true);'), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'WhileStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Literal');
        assert.equal(spy.getCall(1).args[0].value, true);
        assert.equal(spy.getCall(2).args[0].type, 'EmptyStatement');
    });

    it('should process DoWhileStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('do; while (true);'), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'DoWhileStatement');
        assert.equal(spy.getCall(1).args[0].type, 'EmptyStatement');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, true);
    });

    it('should process ForStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('for (1; 2; 3);'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'ForStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Literal');
        assert.equal(spy.getCall(1).args[0].value, 1);
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, 2);
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 3);
        assert.equal(spy.getCall(4).args[0].type, 'EmptyStatement');
    });

    it('should process ForInStatement', function() {
        var spy = sinon.spy();
        iterate(parseJs('for (i in a);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ForInStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Identifier');
        assert.equal(spy.getCall(1).args[0].name, 'i');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'a');
        assert.equal(spy.getCall(3).args[0].type, 'EmptyStatement');
    });

    it('should process ForOfStatement', function() {
        var spy = sinon.spy();
        iterate(parseHarmonyJs('for (i of a);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ForOfStatement');
        assert.equal(spy.getCall(1).args[0].type, 'Identifier');
        assert.equal(spy.getCall(1).args[0].name, 'i');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'a');
        assert.equal(spy.getCall(3).args[0].type, 'EmptyStatement');
    });

    it('should process VariableDeclaration (var)', function() {
        var spy = sinon.spy();
        iterate(parseJs('var x = 1, y = 2;'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'VariableDeclaration');
        assert.equal(spy.getCall(0).args[0].kind, 'var');
        assert.equal(spy.getCall(1).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, 1);
        assert.equal(spy.getCall(3).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(4).args[0].type, 'Literal');
        assert.equal(spy.getCall(4).args[0].value, 2);
    });

    it('should process VariableDeclaration (let)', function() {
        var spy = sinon.spy();
        iterate(parseHarmonyJs('let x = 1, y = 2;'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'VariableDeclaration');
        assert.equal(spy.getCall(0).args[0].kind, 'let');
        assert.equal(spy.getCall(1).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, 1);
        assert.equal(spy.getCall(3).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(4).args[0].type, 'Literal');
        assert.equal(spy.getCall(4).args[0].value, 2);
    });

    it('should process VariableDeclaration (const)', function() {
        var spy = sinon.spy();
        iterate(parseHarmonyJs('const x = 1, y = 2;'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'VariableDeclaration');
        assert.equal(spy.getCall(0).args[0].kind, 'const');
        assert.equal(spy.getCall(1).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
        assert.equal(spy.getCall(2).args[0].value, 1);
        assert.equal(spy.getCall(3).args[0].type, 'VariableDeclarator');
        assert.equal(spy.getCall(4).args[0].type, 'Literal');
        assert.equal(spy.getCall(4).args[0].value, 2);
    });

    it('should process FunctionDeclaration', function() {
        var spy = sinon.spy();
        iterate(parseHarmonyJs('function x(){1;}'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'FunctionDeclaration');
        assert.equal(spy.getCall(0).args[0].id.name, 'x');
        assert.equal(spy.getCall(1).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(2).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
    });
});
