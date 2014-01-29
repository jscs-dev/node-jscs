var assert = require('assert');
var cli = require('../lib/cli');
var hooker = require('hooker');
var Vow = require('vow');

describe('cli', function() {
    beforeEach(function() {
        hooker.hook(process, 'exit', {
            pre: function() {
                return hooker.preempt();
            },
            once: true
        });
    });

    it('should correctly exit if no files specified', function(done) {
        hooker.hook(console, 'error', {
            pre: function(message) {
                assert(message === 'No input files specified. Try option --help for usage information.');

                done();

                return hooker.preempt();
            },
            once: true
        });

        cli({
            args: []
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

        var checker = cli({
            args: ['test/data/cli.js'],
            preset: 'jquery',
            config: 'test/data/cli.json'
        });

        assert(checker.getProcessedConfig().requireCurlyBraces);
    });
});
