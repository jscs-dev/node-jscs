var Checker = require('../../lib/checker');
var assert = require('assert');

describe('options/preset', function() {
    it('should set rules from the jquery preset', function() {
        var checker = new Checker();
        var preset = require('../../presets/jquery');

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
        var preset = require('../../presets/google');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'google'
        });

        var config = checker.getProcessedConfig();

        assert(config.requireCurlyBraces === preset.requireCurlyBraces);
        assert(config.config !== preset);
    });

    it('should set rules from the wikimedia preset', function() {
        var checker = new Checker();
        var preset = require('../../presets/wikimedia');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'wikimedia'
        });

        var config = checker.getProcessedConfig();

        assert(config.requireSpaceAfterKeywords === preset.requireSpaceAfterKeywords);
        assert(config.config !== preset);
    });
});
