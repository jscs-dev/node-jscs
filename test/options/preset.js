var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/preset', function() {
    it('should set rules from the jquery preset', function() {
        var checker = new Checker();
        var preset = require('../../lib/presets/jquery');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'jquery'
        });

        var config = checker.getProcessedConfig();

        assert(config.requireCurlyBraces === preset.requireCurlyBraces);
        assert(config.config !== preset);
    });

    it('should set rules from the google preset', function() {
        var checker = new Checker();
        var preset = require('../../lib/presets/google');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'google'
        });

        var config = checker.getProcessedConfig();

        assert(config.requireCurlyBraces === preset.requireCurlyBraces);
        assert(config.config !== preset);
    });
});
