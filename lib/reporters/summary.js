/**
 * @name summary.js
 * @fileOverview Summary reporter for node-jscs
 * @description Display a summary of the jscs rules broken,
 * how many errors there are, and how many total files are impacted.
 *
 * @author Russell Dempsey <SgtPooki@gmail.com>
 * @version 1.0.0
 */
'use strict';

/* globals require, module */
module.exports = function(errorsCollection) {

    var ruleName;
    var ruleCountObj;
    var numberOfFiles;
    var numberOfErrors;
    var totalErrors = 0;
    var totalFiles = 0;
    var ruleCount = {};
    var Table = require('cli-table');
    var tableOptions = {
        head: [
            'Rule',
            'Total Errors',
            'Files With Errors'
        ],
        colAligns: [
            'middle',
            'middle',
            'middle'
        ],
        style: {
            'padding-left': 0,
            'padding-right': 0,
            head: ['yellow'],
            border: ['red'],
            compact: false
        }
    };
    var table = new Table(tableOptions);

    errorsCollection.forEach(function(errors) {
        var file = errors.getFilename();

        if (!errors.isEmpty()) {
            errors.getErrorList().forEach(function(error) {

                var ruleObj = ruleCount[error.rule];

                if (!ruleObj) {
                    ruleObj = {
                        count: 0,
                        files: {},
                        fileCount: 0
                    };
                    ruleCount[error.rule] = ruleObj;
                }

                totalErrors++;
                ruleObj.count++;

                if (!ruleObj.files[file]) {
                    ruleObj.files[file] = true;
                    ruleObj.fileCount++;
                    totalFiles++;
                }

            });
        }
    });

    for (ruleName in ruleCount) {
        if (ruleCount.hasOwnProperty(ruleName)) {

            ruleCountObj = ruleCount[ruleName];
            numberOfFiles = ruleCountObj.fileCount;
            numberOfErrors = ruleCountObj.count;

            table.push([ruleName, numberOfErrors, numberOfFiles]);
        }
    }

    table.push(['All', totalErrors, totalFiles]);

    console.log(table.toString());

};
