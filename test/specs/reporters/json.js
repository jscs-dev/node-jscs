var assert = require('assert');
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var json = require('../../../lib/reporters/json');

describe('reporters/json', function() {
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
        json([checker.checkString('a++;')]);
        assert(!console.log.called);
    });

    it('should correctly reports 1 error', function() {
        json([checker.checkString('with (x) {}')]);
        var resultStr = '{"input":[{"line":1,"column":1,"message":"Illegal keyword: with"}]}';
        assert.equal(console.log.getCall(0).args[0], resultStr);
        assert(console.log.calledOnce);
    });

    it('should correctly reports 2 errors', function() {
        json([checker.checkString('with (x) {} with (x) {}')]);
        var resultStr = '{"input":[{"line":1,"column":1,"message":"Illegal keyword: with"},' +
                    '{"line":1,"column":13,"message":"Illegal keyword: with"}]}';
        assert.equal(console.log.getCall(0).args[0], resultStr);
        assert(console.log.calledOnce);
    });
});
