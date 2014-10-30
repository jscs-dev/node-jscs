var assert = require('assert');
var sinon = require('sinon');
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

    describe('isFileExcluded', function() {
        it('should return `false` if no `excludeFiles` are defined', function() {
            assert(!configuration.isFileExcluded('1.js'));
            assert(!configuration.isFileExcluded(''));
            assert(!configuration.isFileExcluded('*'));
        });

        it('should return `true` for excluded file', function() {
            configuration.load({excludeFiles: ['1.js', 'app/1.js']});
            assert(configuration.isFileExcluded('1.js'));
            assert(configuration.isFileExcluded('app/1.js'));
            assert(!configuration.isFileExcluded('share/1.js'));
            assert(!configuration.isFileExcluded('2.js'));
            assert(!configuration.isFileExcluded(''));
        });

        it('should return resolve given path', function() {
            configuration.load({excludeFiles: ['app/1.js']});
            assert(configuration.isFileExcluded('app/lib/../1.js'));
        });
    });

    describe('usePlugin', function() {
        it('should run plugin with configuration specified', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.usePlugin(spy);
            assert(spy.called);
            assert(spy.callCount === 1);
            assert(spy.getCall(0).args[0] === configuration);
        });
    });

    describe('override', function() {
        it('should override `preset` setting', function() {
            configuration.registerPreset('1', {});
            configuration.registerPreset('2', {});
            configuration.override({preset: '2'});
            configuration.load({preset: '1'});
            assert(configuration.getProcessedConfig().preset === '2');
        });

        it('should override `maxErrors` setting', function() {
            configuration.override({maxErrors: 2});
            configuration.load({maxErrors: 1});
            assert(configuration.getProcessedConfig().maxErrors === 2);
        });
    });

    describe('load', function() {
        it('should configure rules', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            var configureSpy = sinon.spy(rule, 'configure');
            configuration.registerRule(rule);
            configuration.load({ruleName: true});
            assert(configuration.getProcessedConfig().ruleName === true);
            assert(configureSpy.callCount === 1);
            assert(configureSpy.getCall(0).args.length === 1);
            assert(configureSpy.getCall(0).args[0] === true);
        });

        it('should throw error on unsupported rule', function() {
            try {
                configuration.load({ruleName: true});
                assert(false);
            } catch (e) {
                assert.equal(e.message, 'Unsupported rules: ruleName');
            }
        });

        it('should throw error on list of unsupported rules', function() {
            try {
                configuration.load({ruleName1: true, ruleName2: true});
                assert(false);
            } catch (e) {
                assert.equal(e.message, 'Unsupported rules: ruleName1, ruleName2');
            }
        });

        it('should not configure rule on null', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            var configureSpy = sinon.spy(rule, 'configure');
            configuration.registerRule(rule);
            configuration.load({ruleName: null});
            assert(!configuration.getProcessedConfig().hasOwnProperty('ruleName'));
            assert(configureSpy.callCount === 0);
        });

        it('should load `preset` options', function() {
            configuration.registerPreset('preset', {maxErrors: 1});
            configuration.load({preset: 'preset'});
            assert(configuration.getProcessedConfig().preset === 'preset');
            assert(configuration.getProcessedConfig().maxErrors === 1);
        });

        it('should load `preset` rule settings', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerRule(rule);
            configuration.registerPreset('preset', {ruleName: true});
            configuration.load({preset: 'preset'});
            assert(configuration.getProcessedConfig().preset === 'preset');
            assert(configuration.getProcessedConfig().ruleName === true);
        });

        it('should accept `maxErrors` number', function() {
            configuration.load({maxErrors: 1});
            assert(configuration.getMaxErrors() === 1);
        });

        it('should accept `maxErrors` null', function() {
            configuration.load({maxErrors: null});
            assert(configuration.getMaxErrors() === null);
        });

        it('should accept `excludeFiles`', function() {
            configuration.load({excludeFiles: ['**']});
            assert(configuration.getExcludedFileMasks().length === 1);
            assert(configuration.getExcludedFileMasks()[0] === '**');
        });

        it('should accept `fileExtensions` array', function() {
            configuration.load({fileExtensions: ['.jsx']});
            assert(configuration.getFileExtensions().length === 1);
            assert(configuration.getFileExtensions()[0] === '.jsx');
        });

        it('should accept `fileExtensions` string', function() {
            configuration.load({fileExtensions: '.jsx'});
            assert(configuration.getFileExtensions().length === 1);
            assert(configuration.getFileExtensions()[0] === '.jsx');
        });

        it('should accept `additionalRules` option', function() {
            configuration.load({additionalRules: []});
        });

        it('should accept `additionalRules` to register rules', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule]});
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] === rule);
            assert(configuration.getConfiguredRules().length === 0);
        });

        it('should accept `additionalRules` to configure rules', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule], ruleName: true});
            assert(configuration.getConfiguredRules().length === 1);
            assert(configuration.getConfiguredRules()[0] === rule);
        });

        it('should accept `configPath`', function() {
            configuration.load({configPath: 'app/1.js'});
            assert(configuration.getBasePath() === 'app');
        });

        it('should accept `plugins`', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.load({plugins: [spy]});
            assert(spy.called);
            assert(spy.callCount === 1);
            assert(spy.getCall(0).args[0] === configuration);
        });
    });
});
