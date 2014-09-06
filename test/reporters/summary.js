var Checker = require('../../lib/checker');
var hooker  = require('hooker');
var summary = require('../../lib/reporters/summary');
var fs      = require('fs');
var assert = require('assert');

describe('reporters/summary', function() {
    var path = './test/data/reporters/summary';
    var summaryRawResults;
    var errorCollection;
    var reporterOutput;
    var totalJscsErrors = 0;
    var brokenRules;
    var getBrokenRules = function(errors) {
        var rulesObj = {};

        errors.forEach(function(fileErrors) {
            var filename = fileErrors._file._filename;

            fileErrors._errorList.forEach(function(errorObj) {
                var brokenRule = errorObj.rule;
                var newRulesObj = rulesObj[brokenRule] || {
                    count: 0
                };

                newRulesObj[filename] = newRulesObj[filename] || {
                    count: 0
                };

                newRulesObj.count++;
                newRulesObj[filename].count++;

                rulesObj[brokenRule] = newRulesObj;
            });
        });

        return rulesObj;
    };
    var getTotalJscsErrors = function(errors) {
        var totalErrorCount = 0;

        errors.forEach(function(fileErrors) {
            totalErrorCount += fileErrors._errorList.length;
        });

        return totalErrorCount;
    };
    var processResults = function(done, errors) {
        errorCollection = errors;
        summaryRawResults = summary(errors);
        brokenRules = getBrokenRules(errors);
        totalJscsErrors = getTotalJscsErrors(errors);

        done();
    };

    before(function(done) {
        var checker = new Checker();

        hooker.hook(process.stdout, 'write', {
            pre: function(data) {
                reporterOutput = data;

                return hooker.preempt();
            },

            once: true
        });

        checker.registerDefaultRules();
        checker.configure({ disallowKeywords: ['with'], disallowEmptyBlocks: true });
        checker.checkDirectory(path).then(processResults.bind(null, done));

    });

    describe('column sums', function() {
        it('should show the unique sum of files with errors', function() {
            assert(summaryRawResults[2][2] === 2);
        });

        it('should show the sum of all errors counted', function() {
            var summaryErrorsFound = summaryRawResults[2][1];

            assert(summaryErrorsFound === totalJscsErrors);
        });
    });

    describe('individual broken rules', function() {
        it('should be the same as found by jscs', function() {
            var rule;
            var match;

            assert(Object.keys(brokenRules).length > 1);

            for (rule in brokenRules) {
                if (brokenRules.hasOwnProperty(rule)) {
                    match = reporterOutput.match(new RegExp(rule), 'g');
                    assert(reporterOutput.match(new RegExp(rule), 'g') !== null);
                }
            }
        });

        it('should have their name output only once', function() {
            var rule;
            var match;

            assert(Object.keys(brokenRules).length > 1);

            for (rule in brokenRules) {
                if (brokenRules.hasOwnProperty(rule)) {
                    match = reporterOutput.match(new RegExp(rule), 'g');
                    assert(match.length === 1);
                }
            }
        });

        it('should display the appropriate number errors', function() {
            assert(summaryRawResults.length > 0);

            summaryRawResults.forEach(function(row, i) {
                var brokenRulesObj = brokenRules[row[0]];

                if (brokenRulesObj) {
                    assert(brokenRulesObj.count === summaryRawResults[i][1]);
                }
            });
        });

        it('should display the appropriate number of affected files', function() {
            assert(summaryRawResults.length > 0);

            summaryRawResults.forEach(function(row, i) {
                var brokenRulesObj = brokenRules[row[0]];
                var file;
                var count = 0;

                //SummaryRawResults would produce a row[0] value of 'All' on the last iteration; not a valid rule.
                if (brokenRulesObj) {
                    for (file in brokenRulesObj) {

                        if (file !== 'count') {
                            count++;
                        }
                    }

                    assert(count === summaryRawResults[i][2]);
                }
            });
        });
    });
});
