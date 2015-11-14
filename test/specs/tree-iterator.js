var expect = require('chai').expect;
var esprima = require('esprima');
var sinon = require('sinon');
var iterate = require('../../lib/tree-iterator').iterate;

describe('tree-iterator', function() {

    it('should pass parent and parentCollection', function() {
        var spy = sinon.spy();
        iterate(esprima.parse('1;', {loc: true, range: true, comment: true, tokens: true}), spy);
        expect(spy).to.have.callCount(3);
        expect(spy.getCall(0).args[0].type).to.equal('Program');
        expect(spy.getCall(0).args[1]).to.equal(null);
        expect(spy.getCall(1).args[0].type).to.equal('ExpressionStatement');
        expect(spy.getCall(2).args[0].type).to.equal('Literal');
    });

    it('should not fail for empty object', function() {
        var spy = sinon.spy();
        iterate({}, spy);
        expect(spy).to.have.callCount(0);
    });

    it('should exit thread on false result', function() {
        var spy = sinon.spy(function() {
            return false;
        });
        iterate(esprima.parse('1;', {loc: true, range: true, comment: true, tokens: true}), spy);
        expect(spy).to.have.callCount(1);
        expect(spy.getCall(0).args[0].type).to.equal('Program');
    });

});
