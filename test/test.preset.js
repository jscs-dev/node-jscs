var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/preset', function() {
    it('should set rules from the jquery preset', function() {
        var checker = new Checker();
        var preset = require('../lib/presets/jquery');

        checker.registerDefaultRules();
        checker.configure({
            preset: 'jquery'
        });

        assert(checker.config.requireCurlyBraces === preset.requireCurlyBraces);
        assert(checker.config !== preset);
    });
});
