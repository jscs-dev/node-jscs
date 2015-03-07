var path = require('path');

var sinon = require('sinon');
var assert = require('assert');

var glob = require('glob');
var hasAnsi = require('has-ansi');
var rewire = require('rewire');

var cli = rewire('../../lib/cli');
var configFile = require('../../lib/cli-config');
var Checker = require('../../lib/checker');
var startingDir = process.cwd();

var Vow = require('vow');

describe('modules/cli', function() {
    var oldTTY;

    before(function() {
        cli.__set__('exit', function() {});
    });

    beforeEach(function() {
        oldTTY = process.stdin.isTTY;

        sinon.stub(process.stdout, 'write');
        sinon.stub(process.stderr, 'write');
    });

    afterEach(function() {
        process.stdin.isTTY = oldTTY;
        process.chdir(startingDir);

        // If stdin rewrites were not used, restore them here
        rAfter();
    });

    // Can't do it in afterEach hook, because otherwise name of the test would not be printed
    function rAfter() {
        if (process.stdout.write.restore) {
            process.stdout.write.restore();
        }

        if (process.stderr.write.restore) {
            process.stderr.write.restore();
        }
    }

    function assertNoCliErrors(vow) {
        return vow.promise.always(function() {
            var stdout = process.stdout.write.getCall(0) ? process.stdout.write.getCall(0).args[0] : '';
            var stderr = process.stderr.write.getCall(0) ? process.stderr.write.getCall(0).args[0] : '';
            assert.equal(
                stdout,
                'No code style errors found.\n',
                stderr
            );
            rAfter();
        });
    }

    it('should provide friendly error message if config is corrupted', function() {
        sinon.spy(console, 'error');

        var result = cli({
            config: path.resolve(process.cwd(), './test/data/configs/json/corrupted.json'),
        });

        return result.promise.fail(function() {
            assert(console.error.getCall(0).args[0] === 'Config source is corrupted -');
            console.error.restore();
        });
    });

    it('should throw error if preset does not exist', function() {
        sinon.spy(console, 'error');

        var result = cli({
            args: ['test/data/cli/success.js'],
            preset: 'not-exist'
        });

        return result.promise.always(function() {
            assert.equal(console.error.getCall(0).args[0], 'Preset "not-exist" does not exist');
            console.error.restore();
        });
    });

    it('should return error if default config was not found', function() {
        sinon.spy(console, 'error');
        sinon.stub(configFile, 'load', function() {
            return undefined;
        });

        var result = cli({
            args: []
        });
        var text = 'No configuration found. Add a .jscsrc file to your' +
            ' project root or use the -c option.';

        return result.promise.always(function() {
            assert.equal(console.error.getCall(0).args[0], text);

            configFile.load.restore();
            console.error.restore();
        });
    });

    it('should call checker if config does not exist but "preset" option is defined', function() {
        sinon.stub(configFile, 'load', function() {
            return undefined;
        });
        sinon.spy(Checker.prototype, 'configure');

        var result = cli({
            args: ['test/data/cli/error.js'],
            preset: 'google'
        });

        return result.promise.always(function() {
            var config = Checker.prototype.configure.getCall(0).args[0];

            assert(!Object.keys(config).length);

            Checker.prototype.configure.restore();
            configFile.load.restore();
        });
    });

    it('should correctly exit if no files specified', function(done) {
        sinon.stub(console, 'error', function(message) {
            assert.equal(message, 'No input files specified. Try option --help for usage information.');

            done();
        });

        cli({
            args: []
        });

        console.error.restore();
    });

    it('should exit if no custom config is found', function(done) {
        sinon.stub(console, 'error', function(arg1, arg2, arg3) {
            assert.equal(arg1, 'Configuration source');
            assert.equal(arg2, 'config.js');
            assert.equal(arg3, 'was not found.');

            process.chdir('../');

            done();
        });

        process.chdir('./test/');

        var result = cli({
            config: 'config.js'
        });

        assert(typeof result === 'object');

        console.error.restore();
    });

    it('should set presets', function() {
        var Checker = require('../../lib/checker');
        var originalCheckPath = Checker.prototype.checkPath;

        function restoreCheckPath() {
            Checker.prototype.checkPath = originalCheckPath;
        }

        Checker.prototype.checkPath = function(path) {
            assert(path, 'test/data/cli/success.js');
            return originalCheckPath.apply(this, arguments);
        };

        var result = cli({
            args: ['test/data/cli/success.js'],
            preset: 'jquery',
            config: 'test/data/cli/cli.json'
        });
        return result.promise.then(function() {
            assert(result.checker.getProcessedConfig().requireCurlyBraces);
            restoreCheckPath();
        }).fail(function(e) {
            restoreCheckPath();
            throw e;
        });
    });

    it('should bail out if no inputs files are specified', function() {
        var result = cli({
            args: ['']
        });

        return result.promise.fail(function(status) {
            assert(status);
            rAfter();
        });
    });

    it('should resolve with input via stdin', function() {
        var data = 'var x = [1, 2];\n';

        process.stdin.isTTY = false;

        var result = cli({
            args: []
        });

        process.stdin.emit('data', data);
        process.stdin.emit('end');

        return result.promise.then(function(status) {
            assert(status === 0);
            rAfter();
        });
    });

    it('should bail on bad input via stdin', function() {
        var data = 'var [1, 2];\n';

        process.stdin.isTTY = false;

        var result = cli({
            args: []
        });

        process.stdin.emit('data', data);
        process.stdin.emit('end');

        return result.promise.fail(function(status) {
            assert(status);
            rAfter();
        });
    });

    it('should bail out if no input files are specified for the auto-configure option', function() {
        var result = cli({
            args: [],
            // Commander defaults to a boolean if no args are supplied to the option
            autoConfigure: true
        });

        return result.promise.fail(function(status) {
            assert(status);
            rAfter();
        });
    });

    describe('verbose option', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should not display rule names in error output by default', function() {
            var result = cli({
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            });

            return result.promise.fail(function() {
                assert(console.log.getCall(0).args[0].indexOf('disallowKeywords:') === -1);
            });
        });

        it('should display rule names in error output with verbose option', function() {
            var result = cli({
                verbose: true,
                colors: false,
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            });

            return result.promise.fail(function() {
                assert(console.log.getCall(0).args[0].indexOf('disallowKeywords:') === 0);
            });
        });
    });

    describe('input via stdin (#448)', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
            process.stdin.isTTY = false;
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should accept buffered input via stdin (#564)', function() {
            var result = cli({
                args: []
            });

            process.stdin.emit('data', 'var a = 1;\n');

            // Simulate buffered stdin by delaying before sending the next chunk
            // of data. Note: this arbitrary timeout appears to be the only way
            // to reliably trigger two 'data' events on cmd's stdin.
            setTimeout(function() {
                process.stdin.emit('data', 'var a = 1;\n');
                process.stdin.emit('end');
            }, 500);

            return assertNoCliErrors(result);
        });

        it('should accept non-empty input', function() {
            var result = cli({
                args: []
            });

            process.stdin.emit('data', 'var x = [1, 2];\n');
            process.stdin.emit('end');

            return assertNoCliErrors(result);
        });

        it('should accept empty input: `cat myEmptyFile.js | jscs`', function() {
            var result = cli({
                args: []
            });

            process.stdin.emit('data', '');
            process.stdin.emit('end');

            return assertNoCliErrors(result);
        });

        it('should not fail with additional args supplied: `cat myEmptyFile.js | jscs -n`', function() {
            var result = cli({
                args: [],
                colors: true,
                config: 'test/data/cli/cli.json'
            });

            process.stdin.emit('data', 'var x = 1;\n');
            process.stdin.emit('end');

            return assertNoCliErrors(result);
        });

        it('should not accept piped input if files were specified (#563)', function() {
            var checker = require('../../lib/checker');
            var spy = sinon.spy(checker.prototype, 'checkPath');

            var result = cli({
                args: [__dirname + '/data/cli/success.js']
            });

            return result.promise.always(function() {
                assert(spy.called);
                checker.prototype.checkPath.restore();
                rAfter();
            });
        });

        it('should check stdin if - was supplied as the last argument (#563)', function() {
            var checker = require('../../lib/checker');
            var spy = sinon.spy(checker.prototype, 'checkStdin');

            var result = cli({
                args: [__dirname + '/data/cli/success.js', '-']
            });

            return result.promise.always(function() {
                assert(spy.called);
                checker.prototype.checkStdin.restore();
                rAfter();
            });
        });
    });

    describe('reporter option', function() {
        it('should implicitly set console reporter', function() {
            var result = cli({
                args: ['test/data/cli/error.js'],
                colors: true,
                config: 'test/data/cli/cli.json'
            });

            return result.promise.always(function() {
                assert.equal(path.basename(result.reporter), 'console');
                rAfter();
            });
        });

        it('should set reporter through relative path', function() {
            process.chdir('test');

            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: '../../lib/reporters/junit.js',
                config: 'test/data/cli/cli.json'
            });

            return result.promise.always(function() {
                assert.equal(path.basename(result.reporter), 'junit.js');
                rAfter();
            });
        });

        it('should set reporter through absolute path', function() {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: path.resolve(process.cwd(), 'lib/reporters/junit.js'),
                config: 'test/data/cli/cli.json'
            });

            return result.promise.always(function() {
                assert.equal(path.basename(result.reporter), 'junit.js');
                rAfter();
            });
        });

        it('should set reporter name of pre-defined reporter', function() {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: 'text',
                config: 'test/data/cli/cli.json'
            });

            return result.promise.always(function() {
                assert.equal(path.basename(result.reporter), 'text');
                rAfter();
            });
        });

        it('should return exit if no reporter is found', function() {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: 'does not exist',
                config: 'test/data/cli/cli.json'
            });

            return result.promise.fail(function(status) {
                assert(status.valueOf());
                rAfter();
            });
        });

        describe('reporters exit statuses', function() {
            var rname = /\/(\w+)\.js/;

            // Testing pre-defined reporters with names
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(path) {
                var name = path.match(rname)[1];

                it('should return fail exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();
                    });
                });
            });

            // Testing reporters with absolute paths
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(path) {
                var name = path.match(rname).input;

                it('should return fail exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();
                    });
                });
            });

            // Testing reporters with relative paths
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(filepath) {
                var name = 'lib/reporters' + filepath.match(rname)[0];

                it('should return fail exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function() {
                    return cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();
                    });
                });
            });

        });
    });

    describe('colors option', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should not have colors output', function() {
            var result = cli({
                colors: false,
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            });

            return result.promise.fail(function() {
                assert(!hasAnsi(console.log.getCall(0).args[0]));
            });
        });

        it('should have colors output', function() {
            var result = cli({
                colors: true,
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            });

            return result.promise.fail(function() {
                assert(hasAnsi(console.log.getCall(0).args[0]));
            });
        });
    });

    describe('maxErrors option', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should limit the number of errors reported to the provided amount', function() {
            return cli({
                maxErrors: '1',
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/maxErrors.json'
            })
            .promise.always(function() {
                assert(console.log.getCall(1).args[0].indexOf('1 code style error found.') !== -1);
                rAfter();
            });
        });

        it('should not limit the number of errors reported if non numeric value provided', function() {
            return cli({
                maxErrors: '1a',
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/maxErrors.json'
            })
            .promise.always(function() {
                assert(console.log.getCall(2).args[0].indexOf('2 code style errors found.') !== -1);
                rAfter();
            });
        });

        it('should display a message indicating that there were more errors', function() {
            return cli({
                maxErrors: '1',
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/maxErrors.json'
            })
            .promise.always(function() {
                assert(console.log.getCall(2).args[0].indexOf('Increase `maxErrors` configuration option') !== -1);
                rAfter();
            });
        });

        it('should display a message for input via stdin', function() {
            process.stdin.isTTY = false;

            var result = cli({
                args: [],
                config: 'test/data/cli/maxErrors.json',
                maxErrors: '1'
            });

            process.stdin.emit('data', 'with (x) { y++; }\n');
            process.stdin.emit('end');

            return result.promise.always(function() {
                assert(console.log.getCall(2).args[0].indexOf('Increase `maxErrors` configuration option') !== -1);
                rAfter();
            });
        });
    });

    describe('errorFilter option', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should accept a path to a filter module', function() {
            return assertNoCliErrors(cli({
                errorFilter: __dirname + '/../data/error-filter.js',
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            }));
        });

        it('should accept a relative path to a filter module', function() {
            return assertNoCliErrors(cli({
                errorFilter: '../error-filter.js',
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            }));
        });

        it('should read the error filter from a config file', function() {
            return assertNoCliErrors(cli({
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/errorFilter.json'
            }));
        });
    });

    describe('esprima option', function() {
        beforeEach(function() {
            sinon.spy(console, 'log');
        });

        afterEach(function() {
            console.log.restore();
        });

        it('should use a custom esprima provided in the config file', function() {
            return assertNoCliErrors(cli({
                args: ['test/data/cli/esnext.js'],
                config: 'test/data/cli/esprima.json'
            }));
        });

        it('should use the default esprima if null is provided in the config file', function() {
            return cli({
                args: ['test/data/cli/esnext.js'],
                config: 'test/data/cli/esprimaNull.json'
            })
            .promise.always(function() {
                assert(console.log.getCall(1).args[0].indexOf('1 code style error found.') !== -1);
                rAfter();
            });
        });

        it('should use a custom esprima provided at CLI', function() {
            return assertNoCliErrors(cli({
                args: ['test/data/cli/esnext.js'],
                esprima: 'esprima-harmony-jscs',
                config: 'test/data/cli/cli.json'
            }));
        });
    });

    describe('additionalRules', function() {
        it('should correctly handle additionalRules paths', function() {
            return assertNoCliErrors(cli({
                args: ['test/data/cli/success.js'],
                config: 'test/data/configs/additionalRules/.jscsrc'
            }));
        });
    });

    describe('auto-configure option', function() {
        var deferred;
        var GeneratorMock;

        beforeEach(function() {
            deferred = Vow.defer();
            GeneratorMock = function() {
                return {
                    generate: function() {
                        return deferred.promise();
                    }
                };
            };

            cli.__set__('ConfigGenerator', GeneratorMock);
        });

        it('should handle the configure option', function() {
            deferred.resolve();

            var result = cli({
                args: [],
                autoConfigure: __dirname + '/data/error-filter.js'
            });

            return result.promise.then(function(status) {
                assert.ok(!status);
            });
        });

        it('should print the error message on generation failure', function() {
            var message = 'generation failed';

            deferred.reject(message);

            var result = cli({
                args: [],
                autoConfigure: __dirname + '/data/error-filter.js'
            });

            return result.promise.then(null, function(status) {
                assert.ok(status);
                assert.ok(process.stderr.write.getCall(0).args[0].indexOf(message));
                rAfter();
            });
        });
    });
});
