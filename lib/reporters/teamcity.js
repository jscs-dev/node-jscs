var util = require('util');
/**
 * @param {Errors[]} errorsCollection
 */
module.exports = function(errorsCollection) {
    var errorCount = 0;
    /**
     * Formatting every error set.
     */
    errorsCollection.forEach(function(errors) {
        var file = errors.getFilename();
        console.log(util.format("##teamcity[testSuiteStarted name='JSCS: %s']", file));

        if (!errors.isEmpty()) {
            errors.getErrorList().forEach(function(error) {
                errorCount++;
                console.log(util.format("##teamcity[testStarted name='%s']", file));
                console.log(util.format("##teamcity[testFailed name='%s' message='line %d, col %d, %s']",
                    file, error.line, error.column, error.message));
            });
            console.log(util.format("##teamcity[testSuiteFinished name='JSCS: %s']", file));
        }
    });

    if (!errorCount) {
        console.log("##teamcity[testStarted name='JSCS']");
        console.log("##teamcity[testFinished name='JSCS']");
    }
};