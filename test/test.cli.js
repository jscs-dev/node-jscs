var assert = require('assert');
var cli = require('../lib/cli');
var hooker = require('hooker');

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

    it('should set jquery preset', function(done) {
        hooker.hook(console, 'log', {
            pre: function(message) {
                if (message === '\n1 code style error found.') {
                    hooker.unhook(console);
                    done();
                }

                return hooker.preempt(message);
            }
        });

        var result = cli({
            args: ['test/data/cli.js'],
            preset: 'jquery',
            config: ''
        });

        assert(result.getProcessedConfig().requireCurlyBraces);
    });
});
