var expect = require('chai').expect;
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var summaryReporter = require('../../../lib/reporters/summary');

describe('reporters/summary', function() {
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
        summaryReporter([checker.checkString('a++;')]);
        expect(console.log.getCall(0).args[0]).to.contain('No code style errors found.');
        expect(console.log).to.have.callCount(1);
    });

    it('should correctly report 1 error', function() {
        var expectedByFile = /input.*1/;
        var expectedByRule = /disallowKeywords.*1.*1/;
        var expectedByRuleTotal = /All.*1.*1/;

        summaryReporter([checker.checkString('with (x) {}')]);
        expect(!!expectedByFile.test(console.log.getCall(0).args[0])).to.equal(true);
        expect(!!expectedByRule.test(console.log.getCall(1).args[0])).to.equal(true);
        expect(!!expectedByRuleTotal.test(console.log.getCall(1).args[0])).to.equal(true);
        expect(console.log).to.have.callCount(2);
    });

    it('should correctly report 2 errors', function() {
        var expectedByFile = /input.*2/;
        var expectedByRule = /disallowKeywords.*2.*1/;
        var expectedByRuleTotal = /All.*2.*1/;

        summaryReporter([checker.checkString('with(x){} with(x){} ')]);
        expect(!!expectedByFile.test(console.log.getCall(0).args[0])).to.equal(true);
        expect(!!expectedByRule.test(console.log.getCall(1).args[0])).to.equal(true);
        expect(!!expectedByRuleTotal.test(console.log.getCall(1).args[0])).to.equal(true);
        expect(console.log).to.have.callCount(2);
    });
});
