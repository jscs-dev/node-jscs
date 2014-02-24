var hooker = require('hooker');
var sinon = require('sinon');
var glob = require('glob');
var assert = require('assert');
var Vow = require('vow');

var path = require('path');

var cli = require('../lib/cli');
var startingDir = process.cwd();

describe('cli', function() {
    beforeEach(function() {
        sinon.stub(process, 'exit');
    });

    afterEach(function() {
        process.chdir(startingDir);
        process.exit.restore();
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

    it('should exit if no default config is found', function() {
        hooker.hook(console, 'error', {
            pre: function(message) {
                assert.equal(message, 'Default configuration source was not found.');

                return hooker.preempt();
            },
            once: true
        });

        process.chdir('./test/');

        cli({});
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

        cli({
            config: 'config.js'
        });
    });

    it('should set jquery preset', function() {
        var Checker = require('../lib/checker');
        var old = Checker.prototype.checkPath;

        Checker.prototype.checkPath = function(path) {
            assert(path, 'test/data/cli.js');

            Checker.prototype.checkPath = old;

            return Vow.promise();
        };

        var result = cli({
            args: ['test/data/cli.js'],
            preset: 'jquery',
            config: 'test/data/cli.json'
        });

        assert(result.checker.getProcessedConfig().requireCurlyBraces);
    });

    describe('reporter option', function() {
        beforeEach(function() {
            sinon.stub(process.stdout, 'write');
        });

        // Can't do it in afterEach hook, because otherwise name of the test would not be printed
        function rAfter() {
            process.stdout.write.restore();
        }

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
