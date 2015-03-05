var assert = require('assert');
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var inlinesingle = require('../../../lib/reporters/inlinesingle');

describe('reporters/inlinesingle', function() {
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
        inlinesingle([checker.checkString('a++;')]);

        assert(!console.log.called);
    });

    it('should correctly reports 1 error', function() {
        inlinesingle([checker.checkString('with (x) {}')]);

        assert.equal(console.log.getCall(0).args[0], 'input: line 1, col 0, Illegal keyword: with');
        assert(console.log.calledOnce);
    });

    it('should correctly reports 2 errors', function() {
        inlinesingle([checker.checkString('with (x) {} with (x) {}')]);

        assert.equal(
            console.log.getCall(0).args[0],
            'input: line 1, col 0, Illegal keyword: with\ninput: line 1, col 12, Illegal keyword: with'
        );
        assert(console.log.calledOnce);
    });
});
