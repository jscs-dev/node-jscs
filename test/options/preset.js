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

    describe('wikimedia preset', function() {
        var checker = new Checker();
        var preset = require('../../presets/wikimedia');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'wikimedia'
        });

        var config = checker.getProcessedConfig();

        it('should set the correct rules', function() {
            assert(config.requireSpaceAfterKeywords === preset.requireSpaceAfterKeywords);
            assert(config.config !== preset);
        });

        it('should not report any errors from the sample file', function() {
            return checker.checkFile('./test/data/options/preset/wikimedia.js').then(function(errors) {
                assert(errors.isEmpty());
            });
        });
    });

    it('should set rules from the yandex preset', function() {
        var checker = new Checker();
        var preset = require('../../presets/yandex');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'yandex'
        });

        var config = checker.getProcessedConfig();

        assert(config.requireCurlyBraces === preset.requireCurlyBraces);
        assert(config.config !== preset);
    });
});
