/**
 * @param {Errors[]} errorsCollection
 */
module.exports = function (errorsCollection) {
    var errorCount = 0;
    /**
     * Formatting every error set.
     */
    errorsCollection.forEach(function (errors) {
        if (!errors.isEmpty()) {
            /**
             * Formatting every single error.
             */
            errors.getErrorList().forEach(function(error) {
                errorCount++;
                console.log(errors.explainError(error) + '\n');
            });
        }
    });
    if (errorCount) {
        /**
         * Printing summary.
         */
        console.log('\n' + errorCount + ' code style errors found.');
        process.exit(1);
    } else {
        console.log('No code style errors found.');
    }
};
