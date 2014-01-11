/**
 * Command line implementation for JSCS.
 *
 * Common usage case is:
 *
 * ./node_modules/.bin/jscs file1 dir1 file2 dir2
 */
var fs = require('fs');
var Vow = require('vow');
var path = require('path');

var Checker = require('./checker');

module.exports = function(program) {
    var checker = new Checker();

    var configPath = path.resolve(process.cwd(), program.config || '.jscs.json');
    var doesConfigExist = fs.existsSync(configPath);

    /**
     * Trying to load config.
     * Custom config path can be specified using '-c' option.
     */
    if (doesConfigExist || program.preset) {
        var config = doesConfigExist ? require(configPath) : {};

        if (program.preset) {
            config.preset = program.preset;
        }

        checker.registerDefaultRules();
        checker.configure(config);
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

    return checker;
};
