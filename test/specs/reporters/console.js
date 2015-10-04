var expect = require('chai').expect;
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var consoleReporter = require('../../../lib/reporters/console');

describe('reporters/console', function() {
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
        consoleReporter([checker.checkString('a++;')]);
        expect(console.log).to.have.callCount(0);
    });

    it('should correctly report 1 error', function() {
        consoleReporter([checker.checkString('with (x) {}')]);

        expect(console.log.getCall(0).args[0].indexOf('Illegal keyword: with')).to.be.above(-1);
        expect(console.log.getCall(1).args[0]).to.equal('\n1 code style error found.');
        expect(console.log).to.have.callCount(2);
    });

    it('should correctly reports 2 errors', function() {
        consoleReporter([checker.checkString('with(x){} with(x){} ')]);

        expect(console.log.getCall(0).args[0].indexOf('Illegal keyword: with')).to.be.above(-1);
        expect(console.log.getCall(1).args[0].indexOf('Illegal keyword: with')).to.be.above(-1);
        expect(console.log.getCall(2).args[0]).to.equal('\n2 code style errors found.');
        expect(console.log).to.have.callCount(3);
    });
});
