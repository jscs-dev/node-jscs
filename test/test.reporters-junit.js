var Checker = require('../lib/checker');
var assert = require('assert');
var junit = require('../lib/reporters/junit');
var hooker = require('hooker');
var parser = require('xml2js').parseString;

describe('reporters/junit', function() {
    var checker = new Checker();

    checker.registerDefaultRules();

    it('should correctly report error results', function(done) {
        hooker.hook(process.stdout, 'write', {
            pre: function(xml) {
                process.nextTick(function() {
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

                        done();
                    });
                });

                return hooker.preempt();
            },

            once: true
        });

        checker.configure({ disallowKeywords: ['with'] });
        junit([ checker.checkString('with (x) { y++; }') ]);
    });
});
