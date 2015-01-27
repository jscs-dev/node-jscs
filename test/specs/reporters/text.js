var assert = require('assert');
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
        assert(!console.log.called);
    });

    it('should correctly report 1 error', function() {
        text([checker.checkString('with (x) {}')]);

        var line1 = console.log.getCall(0).args[0];
        var line2 = console.log.getCall(1).args[0];

        assert.equal(line1, 'Illegal keyword: with at input :\n     1 |with (x) {}\n--------^\n');
        assert.equal(line2, '\n1 code style error found.');
        assert(console.log.calledTwice);
    });

    it('should correctly reports 2 errors', function() {
        text([checker.checkString('with(x){} with(x){} ')]);

        var line1 = console.log.getCall(0).args[0];
        var line2 = console.log.getCall(1).args[0];
        var line3 = console.log.getCall(2).args[0];

        assert.equal(line1, 'Illegal keyword: with at input :\n     1 |with(x){} with(x){} \n--------^\n');
        assert.equal(line2, 'Illegal keyword: with at input :\n     1 |with(x){} with(x){} \n------------------^\n');
        assert.equal(line3, '\n2 code style errors found.');
        assert(console.log.calledThrice);
    });
});
