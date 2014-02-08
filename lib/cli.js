/**
 * Command line implementation for JSCS.
 *
 * Common usage case is:
 *
 * ./node_modules/.bin/jscs file1 dir1 file2 dir2
 */
var Vow = require('vow');
var path = require('path');
var Checker = require('./checker');
var configFile = require('./cli-config');

module.exports = function(program) {
    var promise = Vow.promise();
    var checker = new Checker();
    var config = configFile.load(program.config);
    var args = program.args;

    promise.always(function(status) {
        process.exit(status.valueOf());
    });

    /**
     * Trying to load config.
     * Custom config path can be specified using '-c' option.
     */
    if (!config && !program.preset) {
        if (program.config) {
            console.error('Configuration source', program.config, 'was not found.');
        } else {
            console.error('Default configuration source was not found.');
        }

        return promise.reject(1);
    }

    if (args.length === 0) {
        console.error('No input files specified. Try option --help for usage information.');
        return promise.reject(1);
    }

    if (!config) {
        config = {};
    }

    if (program.preset) {
        config.preset = program.preset;
    }

    checker.registerDefaultRules();
    checker.configure(config);

    /**
     * Processing specified files and dirs.
     */
    Vow.all(args.map(checker.checkPath, checker)).then(function(results) {
        var errorsCollection = [].concat.apply([], results);
        var reporter;

        try {
            reporter = require(path.resolve(process.cwd(), program.reporter));
        }
        catch (err) {
            try {
                reporter = require('./reporters/' + program.reporter);
            } catch (e) {
                if (program.reporter) {
                    console.error('Specified reporter doesn\'t exist.');
                    return promise.reject(1);
                }

                var reporterStr = program.colors ? 'console' : 'text';
                reporter = require('./reporters/' + reporterStr);
            }
        }

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

    return {
        checker: checker,
        promise: promise
    };
};
