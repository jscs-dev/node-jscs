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
var path = require('path');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'configuration file path')
    .option('-n, --no-colors', 'clean output without colors')
    .option('-r, --reporter <reporter>', 'error reporter, console - default, text, checkstyle')
    .parse(process.argv);

var Checker = require('./checker');
var checker = new Checker();

var configPath = path.resolve(process.cwd(), program.config || '.jscs.json');

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
            var reporterStr = program.reporter || (program.colors ? 'console' : 'text');
            var reporter = require('./reporters/' + reporterStr);
            reporter(errorsCollection);
        }).fail(function(e) {
            console.error(e.stack);
            /**
             * Quitting with 1 error code.
             */
            process.exit(1);
        });
    } else {
        console.error('No input files specified. Try option --help for usage information.');
        process.exit(1);
    }
} else {
    console.error('Configuration file ' + configPath + ' was not found.');
    /**
     * Quitting with 1 error code.
     */
    process.exit(1);
}
