var assert = require('assert');
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var inline = require('../../../lib/reporters/inline');

describe('reporters/inline', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ disallowKeywords: ['with'] });

        sinon.stub(console, 'log');
    });

    afterEach(function() {
        console.log.restore();
    });

    it('should correctly reports no errors', function() {
        inline([checker.checkString('a++;')]);

        assert(!console.log.called);
    });

    it('should correctly reports 1 error', function() {
        inline([checker.checkString('with (x) {}')]);

        assert.equal(console.log.getCall(0).args[0], 'input: line 1, col 0, Illegal keyword: with');
        assert(console.log.calledOnce);
    });

    it('should correctly reports 2 errors', function() {
        inline([checker.checkString('with (x) {} with (x) {}')]);

        assert.equal(console.log.getCall(0).args[0], 'input: line 1, col 0, Illegal keyword: with');
        assert.equal(console.log.getCall(1).args[0], 'input: line 1, col 12, Illegal keyword: with');
        assert(console.log.calledTwice);
    });
});
