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
    var promise = Vow.promise();
    var checker = new Checker();

    var configPath = path.resolve(process.cwd(), program.config || '.jscs.json');
    var doesConfigExist = fs.existsSync(configPath);

    promise.always(function(status) {
        process.exit(status.valueOf());
    });

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
            Vow.all(program.args.map(checker.checkPath, checker)).then(function(results) {
                var errorsCollection = [].concat.apply([], results);
                var reporterStr = program.reporter || (program.colors ? 'console' : 'text');
                var reporter = require('./reporters/' + reporterStr);
                reporter(errorsCollection);

                errorsCollection.forEach(function(errors) {
                    if (!errors.isEmpty()) {
                        promise.reject(2);
                    }
                });

                promise.fulfill(0);
            }).fail(function(e) {
                console.error(e.stack);
                promise.reject(1);
            });
        } else {
            console.error('No input files specified. Try option --help for usage information.');
            promise.reject(1);
        }
    } else {
        console.error('Configuration file ' + configPath + ' was not found.');
        promise.reject(1);
    }

    return {
        checker: checker,
        promise: promise
    };
};
