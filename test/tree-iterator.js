var assert = require('assert');
var esprima = require('esprima');
var harmonyEsprima = require('esprima-harmony-jscs');
var sinon = require('sinon');
var iterate = require('../lib/tree-iterator').iterate;

describe('modules/tree-iterator', function() {

    function parseJs(source) {
        return esprima.parse(source, {loc: true, range: true, comment: true, tokens: true}).body[0];
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

    it('should process FunctionDeclaration', function() {
        var spy = sinon.spy();
        iterate(parseJs('function x(){1;}'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'FunctionDeclaration');
        assert.equal(spy.getCall(0).args[0].id.name, 'x');
        assert.equal(spy.getCall(1).args[0].type, 'BlockStatement');
        assert.equal(spy.getCall(2).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
    });

    it('should process ArrayExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('[x,1];'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'ArrayExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Literal');
        assert.equal(spy.getCall(3).args[0].value, 1);
    });

    it('should process ObjectExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('({x: y, z: 1});'), spy);
        assert.equal(spy.callCount, 6);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'ObjectExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Property');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
        assert.equal(spy.getCall(4).args[0].type, 'Property');
        assert.equal(spy.getCall(5).args[0].type, 'Literal');
        assert.equal(spy.getCall(5).args[0].value, 1);
    });

    it('should process SequenceExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('(x, y);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'SequenceExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process UnaryExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('-x;'), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'UnaryExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
    });

    it('should process BinaryExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('(x + y);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'BinaryExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process AssignmentExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('x = y;'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'AssignmentExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process UpdateExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('x++;'), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'UpdateExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
    });

    it('should process LogicalExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('(x || y);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'LogicalExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process ConditionalExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('(x ? y : z);'), spy);
        assert.equal(spy.callCount, 5);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'ConditionalExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
        assert.equal(spy.getCall(4).args[0].type, 'Identifier');
        assert.equal(spy.getCall(4).args[0].name, 'z');
    });

    it('should process NewExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('new x(y);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'NewExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process CallExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('x(y);'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'CallExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    it('should process MemberExpression', function() {
        var spy = sinon.spy();
        iterate(parseJs('x.y;'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'MemberExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');

        spy = sinon.spy();
        iterate(parseJs('x[y];'), spy);
        assert.equal(spy.callCount, 4);
        assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(1).args[0].type, 'MemberExpression');
        assert.equal(spy.getCall(2).args[0].type, 'Identifier');
        assert.equal(spy.getCall(2).args[0].name, 'x');
        assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        assert.equal(spy.getCall(3).args[0].name, 'y');
    });

    describe('Harmony', function() {

        function parseHarmonyJs(source) {
            return harmonyEsprima.parse(source, {loc: true, range: true, comment: true, tokens: true}).body[0];
        }

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

        it('should process ArrowFunction', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('(x, y) => {1;};'), spy);
            assert.equal(spy.callCount, 5);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'ArrowFunctionExpression');
            assert.equal(spy.getCall(2).args[0].type, 'BlockStatement');
            assert.equal(spy.getCall(3).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(4).args[0].type, 'Literal');
            assert.equal(spy.getCall(4).args[0].value, 1);
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

        it('should process YieldExpression', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('function* x() { yield y; }'), spy);
            assert.equal(spy.callCount, 5);
            assert.equal(spy.getCall(0).args[0].type, 'FunctionDeclaration');
            assert.equal(spy.getCall(1).args[0].type, 'BlockStatement');
            assert.equal(spy.getCall(2).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(3).args[0].type, 'YieldExpression');
            assert.equal(spy.getCall(4).args[0].type, 'Identifier');
            assert.equal(spy.getCall(4).args[0].name, 'y');
        });

        it('should process ComprehensionExpression', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('([x for (x of y)]);'), spy);
            assert.equal(spy.callCount, 6);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'ComprehensionExpression');
            assert.equal(spy.getCall(2).args[0].type, 'ComprehensionBlock');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
            assert.equal(spy.getCall(3).args[0].name, 'x');
            assert.equal(spy.getCall(4).args[0].type, 'Identifier');
            assert.equal(spy.getCall(4).args[0].name, 'y');
            assert.equal(spy.getCall(5).args[0].type, 'Identifier');
            assert.equal(spy.getCall(5).args[0].name, 'x');
        });

        // Not yet implemented in esprima.
        //
        //it('should process GeneratorExpression', function() {
        //    var spy = sinon.spy();
        //    iterate(parseHarmonyJs('(x for (x of y));'), spy);
        //    assert.equal(spy.callCount, 6);
        //    assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
        //    assert.equal(spy.getCall(1).args[0].type, 'GeneratorExpression');
        //    assert.equal(spy.getCall(2).args[0].type, 'ComprehensionBlock');
        //    assert.equal(spy.getCall(3).args[0].type, 'Identifier');
        //    assert.equal(spy.getCall(3).args[0].name, 'x');
        //    assert.equal(spy.getCall(4).args[0].type, 'Identifier');
        //    assert.equal(spy.getCall(4).args[0].name, 'y');
        //    assert.equal(spy.getCall(5).args[0].type, 'Identifier');
        //    assert.equal(spy.getCall(5).args[0].name, 'x');
        //});

        it('should process TemplateLiteral', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('(`hello, ${world / 2}!!`);'), spy);
            assert.equal(spy.callCount, 5);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'TemplateLiteral');
            assert.equal(spy.getCall(2).args[0].type, 'BinaryExpression');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
            assert.equal(spy.getCall(3).args[0].name, 'world');
            assert.equal(spy.getCall(4).args[0].type, 'Literal');
            assert.equal(spy.getCall(4).args[0].value, 2);
        });

        it('should process TaggedTemplateExpression', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('(raw`hello, ${world / 2}!!`);'), spy);
            assert.equal(spy.callCount, 6);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'TaggedTemplateExpression');
            assert.equal(spy.getCall(2).args[0].type, 'TemplateLiteral');
            assert.equal(spy.getCall(3).args[0].type, 'BinaryExpression');
            assert.equal(spy.getCall(4).args[0].type, 'Identifier');
            assert.equal(spy.getCall(4).args[0].name, 'world');
            assert.equal(spy.getCall(5).args[0].type, 'Literal');
            assert.equal(spy.getCall(5).args[0].value, 2);
        });

        it('should process defaults for FunctionDeclaration', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('function x(y = 1+2){1;}'), spy);
            assert.equal(spy.callCount, 7);
            assert.equal(spy.getCall(0).args[0].type, 'FunctionDeclaration');
            assert.equal(spy.getCall(0).args[0].id.name, 'x');
            assert.equal(spy.getCall(1).args[0].type, 'BinaryExpression');
            assert.equal(spy.getCall(2).args[0].type, 'Literal');
            assert.equal(spy.getCall(2).args[0].value, 1);
            assert.equal(spy.getCall(3).args[0].type, 'Literal');
            assert.equal(spy.getCall(3).args[0].value, 2);
            assert.equal(spy.getCall(4).args[0].type, 'BlockStatement');
            assert.equal(spy.getCall(5).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(6).args[0].type, 'Literal');
            assert.equal(spy.getCall(6).args[0].value, 1);
        });

        it('should process ClassDeclaration', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('class X { foo() {1;} }'), spy);
            assert.equal(spy.callCount, 7);
            assert.equal(spy.getCall(0).args[0].type, 'ClassDeclaration');
            assert.equal(spy.getCall(1).args[0].type, 'ClassBody');
            assert.equal(spy.getCall(2).args[0].type, 'MethodDefinition');
            assert.equal(spy.getCall(3).args[0].type, 'FunctionExpression');
            assert.equal(spy.getCall(4).args[0].type, 'BlockStatement');
            assert.equal(spy.getCall(5).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(6).args[0].type, 'Literal');
            assert.equal(spy.getCall(6).args[0].value, 1);

            spy = sinon.spy();
            iterate(parseHarmonyJs('class X extends Z.W {}'), spy);
            assert.equal(spy.callCount, 5);
            assert.equal(spy.getCall(0).args[0].type, 'ClassDeclaration');
            assert.equal(spy.getCall(1).args[0].type, 'MemberExpression');
            assert.equal(spy.getCall(2).args[0].type, 'Identifier');
            assert.equal(spy.getCall(2).args[0].name, 'Z');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
            assert.equal(spy.getCall(3).args[0].name, 'W');
            assert.equal(spy.getCall(4).args[0].type, 'ClassBody');
        });

        it('should process object shorthands', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('({y, z});'), spy);
            assert.equal(spy.callCount, 6);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'ObjectExpression');
            assert.equal(spy.getCall(2).args[0].type, 'Property');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
            assert.equal(spy.getCall(3).args[0].name, 'y');
            assert.equal(spy.getCall(4).args[0].type, 'Property');
            assert.equal(spy.getCall(5).args[0].type, 'Identifier');
            assert.equal(spy.getCall(5).args[0].name, 'z');
        });

        it('should process ExportDeclaration', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('export var x;'), spy);
            assert.equal(spy.callCount, 3);
            assert.equal(spy.getCall(0).args[0].type, 'ExportDeclaration');
            assert.equal(spy.getCall(1).args[0].type, 'VariableDeclaration');
            assert.equal(spy.getCall(2).args[0].type, 'VariableDeclarator');
        });

        it('should process destructuring assignments: array', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('[x, y] = [y, x];'), spy);
            assert.equal(spy.callCount, 8);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'AssignmentExpression');
            assert.equal(spy.getCall(2).args[0].type, 'ArrayPattern');
            assert.equal(spy.getCall(3).args[0].type, 'Identifier');
            assert.equal(spy.getCall(3).args[0].name, 'x');
            assert.equal(spy.getCall(4).args[0].type, 'Identifier');
            assert.equal(spy.getCall(4).args[0].name, 'y');
            assert.equal(spy.getCall(5).args[0].type, 'ArrayExpression');
            assert.equal(spy.getCall(6).args[0].type, 'Identifier');
            assert.equal(spy.getCall(6).args[0].name, 'y');
            assert.equal(spy.getCall(7).args[0].type, 'Identifier');
            assert.equal(spy.getCall(7).args[0].name, 'x');
        });

        it('should process destructuring assignments: objects', function() {
            var spy = sinon.spy();
            iterate(parseHarmonyJs('({x, y}) = z;'), spy);
            assert.equal(spy.callCount, 8);
            assert.equal(spy.getCall(0).args[0].type, 'ExpressionStatement');
            assert.equal(spy.getCall(1).args[0].type, 'AssignmentExpression');
            assert.equal(spy.getCall(2).args[0].type, 'ObjectPattern');
            assert.equal(spy.getCall(3).args[0].type, 'Property');
            assert.equal(spy.getCall(4).args[0].type, 'Identifier');
            assert.equal(spy.getCall(4).args[0].name, 'x');
            assert.equal(spy.getCall(5).args[0].type, 'Property');
            assert.equal(spy.getCall(6).args[0].type, 'Identifier');
            assert.equal(spy.getCall(6).args[0].name, 'y');
            assert.equal(spy.getCall(7).args[0].type, 'Identifier');
            assert.equal(spy.getCall(7).args[0].name, 'z');
        });
    });
});
