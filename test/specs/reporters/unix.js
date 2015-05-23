var assert = require('assert');
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var unix = require('../../../lib/reporters/unix');

describe('reporters/unix', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({disallowKeywords: ['with']});
        sinon.stub(console, 'log');
    });

    afterEach(function() {
        console.log.restore();
    });

    it('should correctly reports no errors', function() {
        unix([checker.checkString('a++;')]);
        assert(!console.log.called);
    });

    it('should correctly reports 1 error', function() {
        unix([checker.checkString('with (x) {}')]);
        assert.equal(console.log.getCall(0).args[0], 'input:1:0: Illegal keyword: with');
        assert(console.log.calledOnce);
    });

    it('should correctly reports 2 errors', function() {
        unix([checker.checkString('with (x) {} with (x) {}')]);
        assert.equal(console.log.getCall(0).args[0], 'input:1:0: Illegal keyword: with');
        assert.equal(console.log.getCall(1).args[0], 'input:1:12: Illegal keyword: with');
        assert(console.log.calledTwice);
    });
});
