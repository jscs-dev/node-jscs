var expect = require('chai').expect;
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
        expect(console.log).to.have.callCount(0);
    });

    it('should correctly reports 1 error', function() {
        json([checker.checkString('with (x) {}')]);
        var resultStr = '{"input":[{"line":1,"column":3,"message":"disallowKeywords: Illegal keyword: with"}]}';
        expect(console.log.getCall(0).args[0]).to.equal(resultStr);
        expect(console.log).to.have.callCount(1);
    });

    it('should correctly reports 2 errors', function() {
        json([checker.checkString('with (x) {} with (x) {}')]);
        var resultStr = '{"input":[{"line":1,"column":3,"message":"disallowKeywords: Illegal keyword: with"},' +
                    '{"line":1,"column":15,"message":"disallowKeywords: Illegal keyword: with"}]}';
        expect(console.log.getCall(0).args[0]).to.equal(resultStr);
        expect(console.log).to.have.callCount(1);
    });
});
