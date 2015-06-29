var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

var Checker = require('../../../lib/checker');
var summaryReporter = rewire('../../../lib/reporters/summary');

describe('reporters/summary', function() {
    var checker;

    var scenarios = [
        {
            statement: 'with (x) {}',
            results: {
                byFile: {
                    file: 'input',
                    totalError: 1
                },
                byRule: [
                    {
                        name: 'disallowKeywords',
                        totalError: 1,
                        fileError: 1
                    },
                    {
                        name: 'All',
                        totalError: 1,
                        fileError: 1
                    }
                ]
            }
        },
        {
            statement: 'with(x){} with(x){}',
            results: {
                byFile: {
                    file: 'input',
                    totalError: 2
                },
                byRule: [
                    {
                        name: 'disallowKeywords',
                        totalError: 2,
                        fileError: 1
                    },
                    {
                        name: 'All',
                        totalError: 2,
                        fileError: 1
                    }
                ]
            }
        }
    ];

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('valid code syntax', function() {
        it('should correctly reports no errors', function() {
            checker.configure({ disallowKeywords: ['with'] });
            sinon.stub(console, 'log');
            summaryReporter([checker.checkString('a++;')]);
            assert.equal(console.log.getCall(0).args[0], 'No code style errors found.');
            assert(console.log.calledOnce);
            console.log.restore();
        });
    });

    describe('invalid code syntax', function() {
        scenarios.forEach(function(scenario) {
            describe(JSON.stringify(scenario.statement), function() {
                beforeEach(function() {
                    checker.configure({ disallowKeywords: ['with'] });
                    sinon.stub(console, 'log');
                    summaryReporter([checker.checkString(scenario.statement)]);
                });

                afterEach(function() {
                    console.log.restore();
                });

                it('should make 2 console.log calls', function() {
                    assert.equal(console.log.callCount, 2);
                });

                it('should correctly report the number of errors by file name', function() {
                    var actualError = summaryReporter.__get__('errorsByFileTable')[0];
                    var expectedError = scenario.results.byFile;
                    assert.strictEqual(actualError[0], expectedError.file);
                    assert.strictEqual(actualError[1], expectedError.totalError);
                });

                it('should correctly report the number of errors by rule name', function() {
                    var actualErrors = summaryReporter.__get__('errorsByRuleTable');
                    var expectedErrors = scenario.results.byRule;

                    assert.strictEqual(actualErrors.length, expectedErrors.length);
                    for (var i = 0; i < actualErrors.length; i++) {
                        assert.strictEqual(actualErrors[i][0], expectedErrors[i].name);
                        assert.strictEqual(actualErrors[i][1], expectedErrors[i].totalError);
                        assert.strictEqual(actualErrors[i][2], expectedErrors[i].fileError);
                    }
                });
            });
        });
    });
});
