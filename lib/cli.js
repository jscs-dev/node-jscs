/**
 * Command line implementation for JSCS.
 *
 * Common usage case is:
 *
 * ./node_modules/.bin/jscs file1 dir1 file2 dir2
 */
var Checker = require('./checker');
var configFile = require('./cli-config');
var preset = require('./options/preset');

var Vow = require('vow');
var supportsColor = require('supports-color');

var exit = require('exit');

var fs = require('fs');
var path = require('path');

module.exports = function(program) {
    var reporterPath;
    var reporter;
    var config;
    var defer = Vow.defer();
    var promise = defer.promise();
    var checker = new Checker(program.verbose);
    var args = program.args;
    var returnArgs = {
        checker: checker,
        reporter: program.reporter,
        promise: promise
    };

    promise.always(function(status) {
        exit(status.valueOf());
    });

    try {
        config = configFile.load(program.config);
    } catch (e) {
        console.error('Config source is corrupted -', e.toString());
        defer.reject(1);

        return returnArgs;
    }

    /**
     * Trying to load config.
     * Custom config path can be specified using '-c' option.
     */
    if (!config && !program.preset) {
        if (program.config) {
            console.error('Configuration source', program.config, 'was not found.');
        } else {
            console.error('No configuration found. Add a .jscsrc file to your project root or use the -c option.');
        }

        defer.reject(1);

        return returnArgs;
    }

    if (program.preset && !preset.exists(program.preset)) {
        console.error(preset.getDoesNotExistError(program.preset));
        defer.reject(1);

        return returnArgs;
    }

    if (!args.length && process.stdin.isTTY) {
        console.error('No input files specified. Try option --help for usage information.');
        defer.reject(1);

        return returnArgs;
    }

    if (!config) {
        config = {};
    }

    if (program.preset) {
        config.preset = program.preset;
    }

    if (program.reporter) {
        reporterPath = path.resolve(process.cwd(), program.reporter);
        returnArgs.reporter = reporterPath;

        if (!fs.existsSync(reporterPath)) {
            reporterPath = './reporters/' + program.reporter;
        }

    } else {
        reporterPath = './reporters/' + (
            program.colors && supportsColor ? 'console' : 'text'
        );
    }

    try {
        reporter = require(reporterPath);

    } catch (e) {
        console.error('Reporter "%s" doesn\'t exist.', reporterPath);
        defer.reject(1);

        return returnArgs;
    }

    checker.registerDefaultRules();
    checker.configure(config);

    // Handle usage like 'cat myfile.js | jscs' or 'jscs -''
    var usedDash = args[args.length - 1] === '-';
    if (!args.length || usedDash) {
        // So the dash doesn't register as a file
        if (usedDash) { args.length--; }

        checker.checkStdin().then(function(errors) {
            reporter([errors]);

            if (!errors.isEmpty()) {
                defer.reject(2);
            }

            defer.resolve(0);
        });
    }

    if (args.length) {
        /**
         * Processing specified files and dirs.
         */
        Vow.all(args.map(checker.checkPath, checker)).then(function(results) {
            var errorsCollection = [].concat.apply([], results);

            reporter(errorsCollection);

            errorsCollection.forEach(function(errors) {
                if (!errors.isEmpty()) {
                    defer.reject(2);
                }
            });

            defer.resolve(0);
        }).fail(function(e) {
            console.error(e.stack);
            defer.reject(1);
        });
    }

    return returnArgs;
};
