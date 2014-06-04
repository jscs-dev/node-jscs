var hooker = require('hooker');
var sinon = require('sinon');
var glob = require('glob');
var assert = require('assert');
var Vow = require('vow');

var path = require('path');

var cli = require('../lib/cli');
var startingDir = process.cwd();

describe('modules/cli', function() {
    beforeEach(function() {
        sinon.stub(process, 'exit');
        sinon.stub(process.stdout, 'write');
        sinon.stub(process.stderr, 'write');
    });
    afterEach(function() {
        process.chdir(startingDir);
        process.exit.restore();

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

    it('should provide friendly error message if config is corrupted', function(done) {
        sinon.spy(console, 'error');

        var result = cli({
            config: path.resolve(process.cwd(), './test/data/configs/json/corrupted.json'),
        });

        result.promise.fail(function() {
            assert(console.error.getCall(0).args[0] === 'Config source is corrupted -');
            console.error.restore();
            done();
        });
    });

    it('should throw error if preset does not exist', function(done) {
        sinon.spy(console, 'error');

        var result = cli({
            preset: 'not-exist'
        });

        result.promise.fail(function() {
            assert(console.error.getCall(0).args[0] === 'Preset "not-exist" does not exist');
            console.error.restore();
            done();
        });
    });

    it('should correctly exit if no files specified', function() {
        hooker.hook(console, 'error', {
            pre: function(message) {
                assert.equal(message, 'No input files specified. Try option --help for usage information.');

                return hooker.preempt();
            },
            once: true
        });

        cli({
            args: []
        });
    });

    it('should exit if no custom config is found', function() {
        hooker.hook(console, 'error', {
            pre: function(arg1, arg2, arg3) {
                assert.equal(arg1, 'Configuration source');
                assert.equal(arg2, 'config.js');
                assert.equal(arg3, 'was not found.');

                process.chdir('../');

                return hooker.preempt();
            },
            once: true
        });

        process.chdir('./test/');

        var result = cli({
            config: 'config.js'
        });

        assert(typeof result === 'object');
    });

    it('should set jquery preset', function() {
        var Checker = require('../lib/checker');
        var old = Checker.prototype.checkPath;

        Checker.prototype.checkPath = function(path) {
            assert(path, 'test/data/cli.js');

            Checker.prototype.checkPath = old;

            return Vow.defer().promise();
        };

        var result = cli({
            args: ['test/data/cli.js'],
            preset: 'jquery',
            config: 'test/data/cli.json'
        });

        assert(result.checker.getProcessedConfig().requireCurlyBraces);
    });

    it('should bail out if no inputs files are specified', function(done) {
        var result = cli({
            args: ['']
        });

        result.promise.fail(function(status) {
            assert(status);
            rAfter();

            done();
        });
    });

    describe('reporter option', function() {
        it('should set implicitly set checkstyle reporter', function(done) {
            var result = cli({
                args: ['test/data/cli/error.js'],
                config: 'test/data/cli/cli.json'
            });

            result.promise.always(function() {
                assert(path.basename(result.reporter), 'checkstyle');
                rAfter();

                done();
            });
        });

        it('should set implicitly set text reporter', function(done) {
            var result = cli({
                args: ['test/data/cli/error.js'],
                'no-colors': true,
                config: 'test/data/cli/cli.json'
            });

            result.promise.always(function() {
                assert(path.basename(result.reporter), 'text.js');
                rAfter();

                done();
            });
        });

        it('should set reporter through relative path', function(done) {
            process.chdir('test');

            var result = cli({
                args: ['data/cli/error.js'],
                reporter: '../lib/reporters/junit.js',
                config: 'data/cli/cli.json'
            });

            result.promise.always(function() {
                assert(path.basename(result.reporter), 'junit.js');
                rAfter();

                done();
            });
        });

        it('should set reporter through absolute path', function(done) {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: path.resolve(process.cwd(), 'lib/reporters/junit.js'),
                config: 'test/data/cli/cli.json'
            });

            result.promise.always(function() {
                assert(path.basename(result.reporter), 'junit.js');
                rAfter();

                done();
            });
        });

        it('should set reporter name of pre-defined reporter', function(done) {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: 'text',
                config: 'test/data/cli/cli.json'
            });

            result.promise.always(function() {
                assert(path.basename(result.reporter), 'text.js');
                rAfter();

                done();
            });
        });

        it('should return exit if no reporter is found', function(done) {
            var result = cli({
                args: ['test/data/cli/error.js'],
                reporter: 'does not exist',
                config: 'test/data/cli/cli.json'
            });

            result.promise.fail(function(status) {
                assert(status.valueOf());
                rAfter();

                done();
            });
        });

        describe('reporters exit statuses', function() {
            var rname = /\/(\w+)\.js/;

            // Testing pre-defined reporters with names
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(path) {
                var name = path.match(rname)[1];

                it('should return fail exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();

                        done();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();

                        done();
                    });
                });
            });

            // Testing reporters with absolute paths
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(path) {
                var name = path.match(rname).input;

                it('should return fail exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();

                        done();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();

                        done();
                    });
                });
            });

            // Testing reporters with relative paths
            glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(filepath) {
                var name = 'lib/reporters' + filepath.match(rname)[0];

                it('should return fail exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/error.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.fail(function(status) {
                        assert(status.valueOf());
                        rAfter();

                        done();
                    });
                });

                it('should return successful exit code for "' + name + '" reporter', function(done) {
                    cli({
                        args: ['test/data/cli/success.js'],
                        reporter: name,
                        config: 'test/data/cli/cli.json'
                    }).promise.then(function(status) {
                        assert(!status.valueOf());
                        rAfter();

                        done();
                    });
                });
            });

        });
    });
});
