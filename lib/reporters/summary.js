var errorsByFileTable;
var errorsByRuleTable;

/**
 * @param {Errors[]} errorsCollection
 */
module.exports = function(errorsCollection) {
    var Table = require('cli-table');

    var hasError = false;
    var errorsByRule = {};
    var style = {
                'padding-left': 0,
                'padding-right': 0,
                'head': ['yellow'],
                'border': ['green'],
                'compact': false
            };

    errorsByFileTable = new Table({
            'head': ['Path', 'Errors'],
            'colAligns': [
                'middle',
                'middle',
                'middle'
            ],
            'colWidths': [71, 6],
            'style': style
        });

    errorsByRuleTable = new Table({
            'head': ['Rule', 'Errors', 'No of Files'],
            'colAligns': [
                'middle',
                'middle',
                'middle'
            ],
            'colWidths': [59, 6, 11],
            'style': style
        });

    errorsCollection.forEach(function(errors) {
        var fileName = errors.getFilename();
        if (!errors.isEmpty()) {
            hasError = true;
            errorsByFileTable.push([fileName, errors.getErrorCount()]);
            errors.getErrorList().forEach(function(error) {
                if (error.rule in errorsByRule) {
                    errorsByRule[error.rule] .count += 1;
                } else {
                    errorsByRule[error.rule] = {
                        count: 1,
                        files: {}
                    };
                }
                errorsByRule[error.rule].files[fileName] = 1;
            });
        }
    });

    var totalErrors = 0;
    var totalFilesWithErrors = 0;
    Object.getOwnPropertyNames(errorsByRule).forEach(function(ruleName) {
        var fileCount = Object.getOwnPropertyNames(errorsByRule[ruleName].files).length;
        errorsByRuleTable.push([ruleName, errorsByRule[ruleName].count, fileCount]);
        totalErrors += errorsByRule[ruleName].count;
        totalFilesWithErrors += fileCount;
    });
    errorsByRuleTable.push(['All', totalErrors, totalFilesWithErrors]);

    if (hasError === false) {
        console.log('No code style errors found.');
    } else {
        console.log(errorsByFileTable.toString());
        console.log(errorsByRuleTable.toString());
    }
};
