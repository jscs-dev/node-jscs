var expect = require('chai').expect;
var sinon = require('sinon');

var parser = require('xml2js').parseString;

var Checker = require('../../../lib/checker');
var junit = require('../../../lib/reporters/jenkinsjunit');

describe('reporters/jenkinsjunit', function() {
    var checker = new Checker();

    checker.registerDefaultRules();

    it('should correctly report error results', function(done) {
        sinon.stub(console, 'log', function(xml) {
            parser(xml, {trim: true}, function(err, result) {
                if (!err) {
                    var testsuite = result.testsuite;

                    expect(!!testsuite).to.equal(true);
                    expect(testsuite.$.name).to.equal('JSCS');
                    expect(testsuite.$.tests).to.equal('1');
                    expect(testsuite.$.failures).to.equal('1');

                    var testcase = testsuite.testcase[0];
                    expect(!!testcase).to.equal(true);
                    expect(testcase.$.name).to.equal('input');

                    var failure = testcase.failure[0];
                    expect(!!failure).to.equal(true);
                    expect(failure.$.message).to.exist;
                } else {
                    throw err;
                }

                console.log.restore();
                done();
            });
        });

        checker.configure({ disallowKeywords: ['with'] });
        junit([checker.checkString('with (x) { y++; }')]);
    });
});
