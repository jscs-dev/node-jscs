var Checker = require('../../lib/checker');
var assert = require('assert');

describe('options/preset', function() {
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
        var desc = describe;

        desc(presetName + ' preset', function () {
            var checker = new Checker();
            var preset = require('../../presets/' + presetName);

            checker.registerDefaultRules();
            checker.configure({
                preset: presetName
            });

            var config = checker.getProcessedConfig();

            it('should set the correct rules', function () {
                assert(config.requireCurlyBraces === preset.requireCurlyBraces);
                assert(config.config !== preset);
            });

            it('should not report any errors from the sample file', function () {
                return checker.checkFile('./test/data/options/preset/' + presetName + '.js').then(function(errors) {
                    assert(errors.isEmpty());
                });
            });
        });
    }
});
