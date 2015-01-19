var assert = require('assert');
var esprima = require('esprima');
var sinon = require('sinon');
var iterate = require('../lib/tree-iterator').iterate;

describe('modules/tree-iterator', function() {

    it('should pass parent and parentCollection', function() {
        var spy = sinon.spy();
        iterate(esprima.parse('1;', {loc: true, range: true, comment: true, tokens: true}), spy);
        assert.equal(spy.callCount, 3);
        assert.equal(spy.getCall(0).args[0].type, 'Program');
        assert.equal(spy.getCall(0).args[1], null);
        assert.equal(spy.getCall(1).args[0].type, 'ExpressionStatement');
        assert.equal(spy.getCall(2).args[0].type, 'Literal');
    });

    it('should not fail for empty object', function() {
        var spy = sinon.spy();
        iterate({}, spy);
        assert.equal(spy.callCount, 0);
    });

    it('should not fail for XJS nodes', function() {
        var spy = sinon.spy();
        assert.doesNotThrow(function() {
            iterate(require('./data/tree-iterator/jsx-ast'), spy);
        });
        assert.equal(spy.callCount, 42);
    });

    it('should exit thread on false result', function() {
        var spy = sinon.spy(function() {
            return false;
        });
        iterate(esprima.parse('1;', {loc: true, range: true, comment: true, tokens: true}), spy);
        assert.equal(spy.callCount, 1);
        assert.equal(spy.getCall(0).args[0].type, 'Program');
    });

});
