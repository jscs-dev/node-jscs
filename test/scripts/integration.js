var spawn = require('child_process').spawn;
var chalk = require('chalk');
var vow = require('vow');
var vowFs = require('vow-fs');

var SOURCES = ['lib', 'test/specs'];
var MOCHA = 'node_modules/.bin/mocha';

/**
 * Applying passed presets to JSCS sources and tests, then executing tests.
 * So we can make sure nothing breaks during these reformatting actions.
 */
var presets = process.env.TEST_PRESET && vow.resolve(process.env.TEST_PRESET.split(','));

/**
 * Or applying every available preset if nothing passed and do the same.
 */
presets = presets || vowFs.listDir('./presets')
    .then(function(presetFilenames) {
        var presets = presetFilenames.map(function(presetFilename) {
            return presetFilename.replace('.json', '');
        });

        // List of rules that are not used in any of the default presets
        presets.unshift('./test/scripts/forgotten-rules.json');

        return presets;
    });

presets
    .then(function(presets) {
        console.log('\n' + chalk.green('> ') + 'Autofix integration tests: ' + chalk.green(presets.join(', ')));

        return promiseQueue(presets, function(presetName) {
            console.log('\nPreset "' + chalk.green(presetName) + '"');

            logStep('Autofix execution');

            return applyPreset(presetName).then(
                function() {
                    logStep('Unit tests');
                    console.log('');
                    return runTests().then(
                        function() {
                            console.log('');
                            logStep('Unit test on "' + chalk.green(presetName) + '" preset are finished');
                        },
                        logErrorHandler('Unit tests failure'),
                        passthroughProgress
                    );
                },
                logErrorHandler('Autofix failure')
            );
        });
    })
    .progress(function() {})
    .done();

/**
 * Creates log error handler to output error message and pass error further.
 *
 * @param {String} message
 * @returns {Function}
 */
function logErrorHandler(message) {
    return function(e) {
        logStep(message);
        throw e;
    };
}

/**
 * Proxies progress into terminal (stdout).
 *
 * @param {String} data
 */
function passthroughProgress(data) {
    process.stdout.write(data);
}

/**
 * Logs execution step.
 *
 * @param {String} step
 */
function logStep(step) {
    console.log(chalk.magenta(' - ') + step);
}

/**
 * @param {String} presetName
 * @returns {Promise}
 */
function applyPreset(presetName) {
    return runProcess(
        'node',
        ['./bin/jscs', '-x', '-m', '50', '-p', presetName].concat(SOURCES),
        [0, 2],
        false
    );
}

/**
 * Runs JSCS Unit Tests.
 *
 * @returns {Promise}
 */
function runTests() {
    return runProcess('node', [MOCHA, '--color']);
}

/**
 * Creates a queue using promises.
 *
 * @param {Array[]} data
 * @param {Function} promiseCreator
 * @returns {Promise}
 */
function promiseQueue(data, promiseCreator) {
    data = data.concat();
    function keepWorking() {
        if (data.length > 0) {
            var item = data.shift();
            return promiseCreator(item).then(keepWorking);
        }
    }

    return vow.resolve().then(keepWorking);
}

/**
 * Runs a process, returns promise with data notifications.
 *
 * @param {String} executable
 * @param {String[]} args
 * @param {Number[]} [successCodes]
 * @param {Boolean} [proxyData = true] - proxy string from 'data' event?
 * @returns {Promise}
 */
function runProcess(executable, args, successCodes, proxyData) {
    successCodes = successCodes || [0];
    proxyData = proxyData === undefined ? true : proxyData;

    var defer = vow.defer();
    var subProcess = spawn(executable, args, {
        stdio: [0, 'pipe', 'pipe'],
        timeout: Infinity
    });
    var stderr = '';
    subProcess.stderr.on('data', function(data) { stderr += data; });

    subProcess.stdout.on('data', function(data) {
        if (proxyData) {

            // Can't use defer.notify, since to much of data trips Vow
            // defer.notify(String(data));
            passthroughProgress(String(data));
        }
    });

    subProcess.on('close', function(code) {
        if (successCodes.indexOf(code) === -1) {
            defer.reject(new Error('Command failed: ' + executable + ' ' + args.join(' ') + '\n' + stderr));
        } else {
            defer.resolve();
        }
    });

    return defer.promise();
}

/**
 * Exit handler. Restores file changes before exit.
 *
 * @param {Error} error
 */
function exit(error) {
    var errorCode = 0;
    if (error) {
        console.error(error);
        errorCode = 1;
    }
    console.log('\n\nRestoring files...');
    runProcess('git', ['checkout'].concat(SOURCES)).then(
        function() {
            process.exit(errorCode);
        },
        function() {
            process.exit(1);
        },
        function() {}
    );
}

// Listen for all "exit" events so we could put everything back
process.on('exit', exit);
process.on('SIGINT', exit);
process.on('uncaughtException', exit);
