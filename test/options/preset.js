var Checker = require('../../lib/checker');
var preset = require('../../lib/options/preset');
var assert = require('assert');

describe('options/preset', function() {
    testPreset('airbnb');
    testPreset('crockford');
    testPreset('google');
    testPreset('jquery');
    testPreset('mdcs');
    testPreset('wikimedia');
    testPreset('yandex');

    /**
     * Helper to test a given preset's configuration against its test file
     *
     * Expects the given preset to have a configuration in /presets
     * and real code taken from that project in /test/data/options/preset
     *
     * @example testPreset('google')
     * @param  {String} presetName
     */
    function testPreset(presetName) {
        describe(presetName + ' preset', function() {
            var checker = new Checker();
            var preset = require('../../presets/' + presetName);

            checker.registerDefaultRules();
            checker.configure({
                preset: presetName
            });

            var config = checker.getProcessedConfig();

            it('should set the correct rules', function() {
                assert(config.requireCurlyBraces === preset.requireCurlyBraces);
                assert(config.config !== preset);
            });

            it('should not report any errors from the sample file', function() {
                return checker.checkFile('./test/data/options/preset/' + presetName + '.js').then(function(errors) {
                    assert(errors.isEmpty());
                });
            });
        });
    }

    describe('getDoesNotExistError', function() {
        it('returns the correct error message', function() {
            assert(preset.getDoesNotExistError('foo') === 'Preset "foo" does not exist');
        });
    });

    describe('exists', function() {
        it('returns true for existing presets', function() {
            assert(preset.exists('jquery'));
        });

        it('returns false for non-existant presets', function() {
            assert(!preset.exists('aPresetThatWillNeverExist'));
        });
    });

    describe('extend', function() {
        it('returns true if preset not present in config', function() {
            assert(preset.extend({ not: 'real' }));
        });

        it('returns false if provided preset is not a real preset', function() {
            assert(!preset.extend({ preset: 'aPresetThatWillNeverExist' }));
        });

        it('removes the preset key from the config, and add its rules to the config', function() {
            var config = {
                preset: 'jquery',
                fakeRule: true
            };

            preset.extend(config);

            assert(!config.preset);
            assert(config.requireOperatorBeforeLineBreak);
            assert(config.fakeRule);
        });
    });
});
