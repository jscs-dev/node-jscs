var xml = require('xmlbuilder');

module.exports = function(errorCollection) {
    var i = 0;
    var testsuite = xml.create('testsuite');

    testsuite.att('name', 'JSCS');
    testsuite.att('tests', errorCollection.length);

    errorCollection.forEach(function(errors) {
        var errorsCount = errors.getErrorCount();
        var testcase = testsuite.ele('testcase', {
            name: errors.getFilename()
        });

        i += errorsCount;

        errors.getErrorList().forEach(function(error) {
            testcase.ele('failure', { 'message': errors.explainError(error)});
        });
    });

    testsuite.att('failures', i);

    console.log(testsuite.end({pretty: true}));
};
