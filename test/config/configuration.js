var assert = require('assert');
var Configuration = require('../../lib/config/configuration');

describe('modules/config/configuration', function() {

    var configuration;
    beforeEach(function() {
        configuration = new Configuration();
    });

    describe('constructor', function() {
        it('should set default base path', function() {
            assert(configuration.getBasePath() === '.');
        });

        it('should set default file extensions', function() {
            assert(configuration.getFileExtensions().length === 1);
            assert(configuration.getFileExtensions()[0] === '.js');
        });

        it('should have no default registered rules', function() {
            assert(configuration.getRegisteredRules().length === 0);
        });

        it('should have no default configured rules', function() {
            assert(configuration.getConfiguredRules().length === 0);
        });

        it('should have no default presets', function() {
            assert(Object.keys(configuration.getRegisteredPresets()).length === 0);
        });

        it('should have no default excluded file masks', function() {
            assert(configuration.getExcludedFileMasks().length === 0);
        });

        it('should have no default maximal error count', function() {
            assert(configuration.getMaxErrors() === null);
        });
    });

    describe('registerRule', function() {
        it('should add rule to registered rule list', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                }
            };
            configuration.registerRule(rule);
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] === rule);
            assert(configuration.getConfiguredRules().length === 0);
        });

        it('should fail on duplicate rule name', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                }
            };
            configuration.registerRule(rule);
            try {
                configuration.registerRule(rule);
                assert(false);
            } catch (e) {
                assert(e.message === 'Rule "ruleName" is already registered');
            }
        });
    });

    describe('getRegisteredRules', function() {
        it('should return registered rule list', function() {
            var rule1 = {
                getOptionName: function() {
                    return 'ruleName1';
                }
            };
            var rule2 = {
                getOptionName: function() {
                    return 'ruleName2';
                }
            };
            configuration.registerRule(rule1);
            configuration.registerRule(rule2);
            assert(configuration.getRegisteredRules().length === 2);
            assert(configuration.getRegisteredRules()[0] === rule1);
            assert(configuration.getRegisteredRules()[1] === rule2);
        });
    });

    describe('getRegisteredPresets', function() {
        it('should return registered presets object', function() {
            var preset = {maxErrors: 5};
            assert(Object.keys(configuration.getRegisteredPresets()).length === 0);
            configuration.registerPreset('company', preset);
            assert(Object.keys(configuration.getRegisteredPresets()).length === 1);
            assert(configuration.getRegisteredPresets().company === preset);
        });
    });

    describe('hasPreset', function() {
        it('should return true if preset presents in collection', function() {
            var preset = {maxErrors: 5};
            assert(!configuration.hasPreset('company'));
            configuration.registerPreset('company', preset);
            assert(configuration.hasPreset('company'));
        });
    });

    describe('registerDefaultRules', function() {
        it('should register built-in rules', function() {
            configuration.registerDefaultRules();
            var optionNames = configuration.getRegisteredRules().map(function(rule) {
                return rule.getOptionName();
            });

            // checking for some of them
            assert(optionNames.indexOf('requireCurlyBraces') !== -1);
            assert(optionNames.indexOf('disallowEmptyBlocks') !== -1);
        });
    });

    describe('registerDefaultPresets', function() {
        it('should register built-in presets', function() {
            assert(!configuration.hasPreset('jquery'));
            configuration.registerDefaultPresets();
            assert(configuration.hasPreset('airbnb'));
            assert(configuration.hasPreset('crockford'));
            assert(configuration.hasPreset('google'));
            assert(configuration.hasPreset('jquery'));
            assert(configuration.hasPreset('mdcs'));
            assert(configuration.hasPreset('wikimedia'));
            assert(configuration.hasPreset('yandex'));
        });
    });

    describe('getConfiguredRules', function() {
        it('should return configured rules after config load', function() {
            assert(configuration.getConfiguredRules().length === 0);
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerRule(rule);
            configuration.load({ruleName: true});
            assert(configuration.getConfiguredRules().length === 1);
            assert(configuration.getConfiguredRules()[0] === rule);
        });
    });
});
