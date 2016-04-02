var expect = require('chai').expect;
var sinon = require('sinon');

var Checker = require('../../../lib/checker');
var text = require('../../../lib/reporters/text');

describe('reporters/text', function() {
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
        text([checker.checkString('a++;')]);
        expect(console.log).to.have.callCount(0);
    });

    it('should correctly report 1 error', function() {
        text([checker.checkString('with (x) {}')]);

        var line1 = console.log.getCall(0).args[0];
        var line2 = console.log.getCall(1).args[0];

        expect(line1)
            .to.equal('disallowKeywords: Illegal keyword: with at input :\n' +
                '     1 |with (x) {}\n----------^\n');

        expect(line2).to.equal('\n1 code style error found.');
        expect(console.log).to.have.callCount(2);
    });

    it('should correctly reports 2 errors', function() {
        text([checker.checkString('with(x){} with(x){} ')]);

        var line1 = console.log.getCall(0).args[0];
        var line2 = console.log.getCall(1).args[0];
        var line3 = console.log.getCall(2).args[0];

        var line1Output = 'disallowKeywords: Illegal keyword: with at input :\n     1 ' +
          '|with(x){} with(x){} \n----------^\n';
        var line2Output = 'disallowKeywords: Illegal keyword: with at input :\n     1 ' +
          '|with(x){} with(x){} \n--------------------^\n';
        var line3Output = '\n2 code style errors found.';
        expect(line1).to.equal(line1Output);
        expect(line2).to.equal(line2Output);
        expect(line3).to.equal(line3Output);
        expect(console.log).to.have.callCount(3);
    });
});
