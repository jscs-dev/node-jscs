var assert = require('assert');
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
        assert(!console.log.called);
    });

    it('should correctly report 1 error', function() {
        consoleReporter([checker.checkString('with (x) {}')]);

        assert(console.log.getCall(0).args[0].indexOf('Illegal keyword: with') > -1);
        assert.equal(console.log.getCall(1).args[0], '\n1 code style error found.');
        assert(console.log.calledTwice);
    });

    it('should correctly reports 2 errors', function() {
        consoleReporter([checker.checkString('with(x){} with(x){} ')]);

        assert(console.log.getCall(0).args[0].indexOf('Illegal keyword: with') > -1);
        assert(console.log.getCall(1).args[0].indexOf('Illegal keyword: with') > -1);
        assert.equal(console.log.getCall(2).args[0], '\n2 code style errors found.');
        assert(console.log.calledThrice);
    });
});
