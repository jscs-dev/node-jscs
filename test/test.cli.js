var hooker = require('hooker');
var sinon = require('sinon');
var glob = require('glob');
var assert = require('assert');
var Vow = require('vow');

var path = require('path');

var cli = require('../lib/cli');

describe('cli', function() {
    var cwd = process.cwd();

    beforeEach(function() {
        sinon.stub(process, 'exit');
    });

    afterEach(function() {
        process.exit.restore();

        // Just in case tests have changed process.cwd(), reset it
        process.chdir(cwd);
    });

    it('should correctly exit if no files specified', function() {
        hooker.hook(console, 'error', {
            pre: function(message) {
                assert(message === 'No input files specified. Try option --help for usage information.');

                return hooker.preempt();
            },
            once: true
        });

        cli({
            args: []
        });
    });

    it('should exit if no default config is found', function(done) {
        hooker.hook(console, 'error', {
            pre: function(message, config) {
                assert.equal(
                    config,
                    path.resolve(process.cwd(), '.jscsrc')
                );

                done();

                return hooker.preempt();
            },
            once: true
        });

        process.chdir('./test/');

        cli({});
    });

    it('should exit if no custom config is found', function(done) {
        hooker.hook(console, 'error', {
            pre: function(message, config) {
                assert.equal(
                    config,
                    path.resolve(process.cwd(), 'config.js')
                );

                done();

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

    describe('reporters exit statuses', function() {
        var rname = /\/(\w+)\.js/;

        glob.sync(path.resolve(process.cwd(), 'lib/reporters/*.js')).map(function(path) {
            var name = path.match(rname)[1];

            it('should return succeful exit code for "' + name + '" reporter', function(done) {

                // Can't do it in beforeEach hook,
                // because otherwise name of the test would not be printed
                sinon.stub(process.stdout, 'write');

                cli({
                    args: ['test/data/cli/success.js'],
                    reporter: name
                }).promise.then(function(status) {
                    assert(!status.valueOf());

                    process.stdout.write.restore();

                    done();
                });
            });

            it('should return fail exit code for "' + name + '" reporter', function(done) {
                sinon.stub(process.stdout, 'write');

                cli({
                    args: ['test/data/cli/error.js'],
                    reporter: name
                }).promise.fail(function(status) {
                    assert(status.valueOf());
                    process.stdout.write.restore();

                    done();
                });
            });
        });
    });
});
