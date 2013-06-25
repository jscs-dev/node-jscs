/**
 * Command line implementation for JSCS.
 * 
 * Common usage case is:
 * 
 * ./node_modules/.bin/jscs file1 dir1 file2 dir2
 */
var fs = require('fs');
var program = require('commander');
var Vow = require('vow');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'configuration file path')
    .parse(process.argv);

var Checker = require('./checker');
var checker = new Checker();

var configPath = program.config || (process.cwd() + '/.jscs.json');

/**
 * Trying to load config.
 * Custom config path can be specified using '-c' option.
 */
if (fs.existsSync(configPath)) {
    /**
     * Using default rule set.
     * There is no support for custom rule sets yet.
     */
    checker.registerDefaultRules();
    checker.configure(require(configPath));
    if (program.args.length > 0) {
        /**
         * Processing specified files and dirs.
         */
        Vow.all(program.args.map(function(path) {
            return checker.checkPath(path);
        })).then(function (results) {
            var errorsCollection = [].concat.apply([], results);
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
                        console.log(
                            errors.explainError(error, true) + '\n'
                        );
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
        }).fail(function(e) {
            console.log(e.stack);
            /**
             * Quitting with 1 error code.
             */
            process.exit(1);
        });
    } else {
        console.log('No input files specified. Try option --help for usage information.');
        process.exit(0);
    }
} else {
    console.log('Configuration file ' + configPath + ' was not found.');
    /**
     * Quitting with 1 error code.
     */
    process.exit(1);
}

