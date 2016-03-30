var expect = require('chai').expect;
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

        expect(console.log).to.have.callCount(0);
    });

    it('should correctly reports 1 error', function() {
        inlinesingle([checker.checkString('with (x) {}')]);

        expect(console.log.getCall(0).args[0])
            .to.equal('input: line 1, col 2, disallowKeywords: Illegal keyword: with');
        expect(console.log).to.have.callCount(1);
    });

    it('should correctly reports 2 errors', function() {
        inlinesingle([checker.checkString('with (x) {} with (x) {}')]);

        expect(console.log.getCall(0).args[0])
          .to.equal('input: line 1, col 2, disallowKeywords: Illegal keyword:' +
                    ' with\ninput: line 1, col 14, disallowKeywords: Illegal keyword: with');
        expect(console.log).to.have.callCount(1);
    });
});
