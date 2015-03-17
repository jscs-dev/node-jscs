var assert = require('assert');
var sinon = require('sinon');

var parser = require('xml2js').parseString;

var Checker = require('../../../lib/checker');
var junit = require('../../../lib/reporters/junit');

describe('reporters/junit', function() {
    var checker = new Checker();

    checker.registerDefaultRules();

    it('should correctly report error results', function(done) {
        sinon.stub(console, 'log', function(xml) {
            parser(xml, {trim: true}, function(err, result) {
                if (!err) {
                    var testsuite = result.testsuite;

                    assert(!!testsuite);
                    assert(testsuite.$.name === 'JSCS');
                    assert(testsuite.$.tests === '1');
                    assert(testsuite.$.failures === '1');

                    var testcase = testsuite.testcase[0];
                    assert(!!testcase);
                    assert(testcase.$.name === 'input');
                    assert(testcase.$.failures === '1');

                    assert(testcase.failure[0].length);
                } else {
                    assert(false, err);
                }

                console.log.restore();
                done();
            });
        });

        checker.configure({ disallowKeywords: ['with'] });
        junit([checker.checkString('with (x) { y++; }')]);
    });
});
