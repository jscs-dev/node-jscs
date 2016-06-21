var expect = require('chai').expect;
var sinon = require('sinon');
var Configuration = require('../../../lib/config/configuration');

describe('config/configuration', function() {

    var configuration;
    beforeEach(function() {
        configuration = new Configuration();
    });

    describe('constructor', function() {
        it('should set default base path', function() {
            expect(configuration.getBasePath()).to.equal('.');
        });

        it('should have no default registered rules', function() {
            expect(configuration.getRegisteredRules().length).to.equal(0);
        });

        it('should have no default configured rules', function() {
            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should have no default presets', function() {
            expect(Object.keys(configuration.getRegisteredPresets()).length).to.equal(0);
        });

        it('should have no default preset', function() {
            expect(configuration.getPresetName()).to.equal(null);
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
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.equal(rule);
            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should accept class', function() {
            var Rule = function() {
                this.getOptionName = function() {
                    return 'ruleName';
                };
            };
            configuration.registerRule(Rule);
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.be.an.instanceof(Rule);
            expect(configuration.getConfiguredRules().length).to.equal(0);
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
                throw new Error();
            } catch (e) {
                expect(e.message).to.equal('Rule "ruleName" is already registered');
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
            expect(configuration.getRegisteredRules().length).to.equal(2);
            expect(configuration.getRegisteredRules()[0]).to.equal(rule1);
            expect(configuration.getRegisteredRules()[1]).to.equal(rule2);
        });
    });

    describe('isES3Enabled', function() {
        it('should return false when null is specified', function() {
            configuration.load({es3: null});
            expect(configuration.isES3Enabled()).to.equal(false);
        });

        it('should return false when false is specified', function() {
            configuration.load({es3: false});
            expect(configuration.isES3Enabled()).to.equal(false);
        });

        it('should return true when true is specified', function() {
            configuration.load({es3: true});
            expect(configuration.isES3Enabled()).to.equal(true);
        });

        it('should return false when unspecified', function() {
            configuration.load({});
            expect(configuration.isES3Enabled()).to.equal(false);
        });
    });

    describe('getRegisteredPresets', function() {
        it('should return registered presets object', function() {
            var preset = {maxErrors: 5};
            expect(Object.keys(configuration.getRegisteredPresets()).length).to.equal(0);
            configuration.registerPreset('company', preset);
            expect(Object.keys(configuration.getRegisteredPresets()).length).to.equal(1);
            expect(configuration.getRegisteredPresets().company).to.equal(preset);
        });
    });

    describe('getUnsupportedRuleNames', function() {
        it('should return a list of the names of unsupported rules found', function() {
            configuration.load({foobar: 5});
            expect(configuration.getUnsupportedRuleNames().length).to.equal(1);
        });
    });

    describe('getErrorFilter', function() {
        it('should return the supplied error filter', function() {
            configuration.load({errorFilter: function() {}});
            expect(configuration.getErrorFilter()).to.be.a('function');
        });
    });

    describe('hasPreset', function() {
        it('should return true if preset presents in collection', function() {
            var preset = {maxErrors: 5};
            expect(!configuration.hasPreset('company')).to.equal(true);
            configuration.registerPreset('company', preset);
            expect(!!configuration.hasPreset('company')).to.equal(true);
        });
    });

    describe('registerPreset', function() {
        it('should throw if preset is not an object', function() {
            expect(
                configuration.registerPreset.bind(configuration, 'test', undefined)
            ).to.throw('Preset should be an object');
        });

        it('should throw if preset if it is not JSON', function() {
            expect(
                configuration.registerPreset.bind(configuration, 'test', {
                    'test': function() {}
                })
            ).to.throw('Preset should be an JSON object');
        });
    });

    describe('getFix', function() {
        it('should enable "fix" option', function() {
            configuration.load({ fix: true });
            expect(configuration.getFix()).to.equal(true);
        });

        it('should disable "fix" option', function() {
            configuration.load({ fix: false });
            expect(configuration.getFix()).to.equal(false);
        });

        it('should disable "fix" option with null value', function() {
            configuration.load({ fix: null });
            expect(configuration.getFix()).to.equal(false);
        });

        it('should return "false" if value is not defined', function() {
            configuration.load({ });
            expect(configuration.getFix()).to.equal(false);
        });

        it('should return "false" value is value is not defined', function() {
            configuration.load({ });
            expect(configuration.getFix()).to.equal(false);
        });
    });

    describe('getMaxErrors', function() {
        it('should have 50 default error count', function() {
            expect(configuration.getMaxErrors()).to.equal(50);
        });

        it('should accept `maxErrors` number', function() {
            configuration.load({maxErrors: 1});
            expect(configuration.getMaxErrors()).to.equal(1);
        });

        it('should accept `maxErrors` null', function() {
            configuration.load({maxErrors: null});
            expect(configuration.getMaxErrors()).to.equal(null);
        });

        it('should set `maxErrors` to infinity if "fix" option is enabled', function() {
            configuration.load({fix: true});
            expect(configuration.getMaxErrors()).to.equal(Infinity);
        });

        it('should set `maxErrors` to infinity if "autoConfigure" option is enabled', function() {
            configuration.load({fix: true});
            expect(configuration.getMaxErrors()).to.equal(Infinity);
        });
    });

    describe('registerDefaultRules', function() {
        it('should register built-in rules', function() {
            configuration.registerDefaultRules();
            var optionNames = configuration.getRegisteredRules().map(function(rule) {
                return rule.getOptionName();
            });

            // checking for some of them
            expect(optionNames.indexOf('requireCurlyBraces')).to.not.equal(-1);
            expect(optionNames.indexOf('disallowEmptyBlocks')).to.not.equal(-1);
        });
    });

    describe('registerDefaultPresets', function() {
        it('should register built-in presets', function() {
            expect(!configuration.hasPreset('jquery')).to.equal(true);
            configuration.registerDefaultPresets();
            expect(!!configuration.hasPreset('airbnb')).to.equal(true);
            expect(!!configuration.hasPreset('crockford')).to.equal(true);
            expect(!!configuration.hasPreset('google')).to.equal(true);
            expect(!!configuration.hasPreset('jquery')).to.equal(true);
            expect(!!configuration.hasPreset('mdcs')).to.equal(true);
            expect(!!configuration.hasPreset('wikimedia')).to.equal(true);
            expect(!!configuration.hasPreset('grunt')).to.equal(true);
            expect(!!configuration.hasPreset('node-style-guide')).to.equal(true);
            expect(!!configuration.hasPreset('wordpress')).to.equal(true);
            expect(!!configuration.hasPreset('idiomatic')).to.equal(true);
        });
    });

    describe('getConfiguredRules', function() {
        it('should return configured rules after config load', function() {
            expect(configuration.getConfiguredRules().length).to.equal(0);
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerRule(rule);
            configuration.load({ruleName: true});
            expect(configuration.getConfiguredRules().length).to.equal(1);
            expect(configuration.getConfiguredRules()[0]).to.equal(rule);
        });
    });

    describe('getConfiguredRule', function() {
        it('should return configured rule after config load', function() {
            expect(configuration.getConfiguredRule('ruleName')).to.equal(null);
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerRule(rule);
            configuration.load({ruleName: true});
            expect(configuration.getConfiguredRule('ruleName')).to.be.a('object');
        });
    });

    describe('isFileExcluded', function() {
        it('should return `false` if no `excludeFiles` are defined', function() {
            expect(!configuration.isFileExcluded('1.js')).to.equal(true);
            expect(!configuration.isFileExcluded('')).to.equal(true);
            expect(!configuration.isFileExcluded('*')).to.equal(true);
        });

        it('should return `true` for excluded file', function() {
            configuration.load({excludeFiles: ['1.js', 'app/1.js']});
            expect(!!configuration.isFileExcluded('1.js')).to.equal(true);
            expect(!!configuration.isFileExcluded('app/1.js')).to.equal(true);
            expect(!configuration.isFileExcluded('share/1.js')).to.equal(true);
            expect(!configuration.isFileExcluded('2.js')).to.equal(true);
            expect(!configuration.isFileExcluded('')).to.equal(true);
        });

        it('should return resolve given path', function() {
            configuration.load({excludeFiles: ['app/1.js']});
            expect(!!configuration.isFileExcluded('app/lib/../1.js')).to.equal(true);
        });
    });

    describe('extract', function() {
        it('should not check any files by default', function() {
            configuration.load({});
            expect(configuration.getExtractFileMasks()).to.deep.equal([]);
        });

        it('should check default files with value true', function() {
            configuration.load({
                extract: true
            });
            expect(configuration.getExtractFileMasks()).to.deep.equal(['**/*.+(htm|html|xhtml)']);
        });

        it('should not check any files with value false', function() {
            configuration.load({
                extract: false
            });
            expect(configuration.getExtractFileMasks()).to.deep.equal([]);
        });

        it('should set array of masks and also check *.htm, *.html, *.xhtml', function() {
            configuration.load({
                extract: ['foo', 'bar']
            });
            expect(configuration.getExtractFileMasks()).to.deep.equal(['foo', 'bar']);
        });

        it('should throw an exception when set wrong string value', function() {
            expect(function() {
                configuration.load({
                    extract: 'foo'
                });
            }).to.throw();
        });
    });

    describe('shouldExtractFile', function() {
        it('should not check anything by default', function() {
            configuration.load({});
            expect(configuration.shouldExtractFile('file.htm')).to.equal(false);
            expect(configuration.shouldExtractFile('file.html')).to.equal(false);
            expect(configuration.shouldExtractFile('file.xhtml')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.htm')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.html')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.xhtml')).to.equal(false);

            expect(configuration.shouldExtractFile('file.txt')).to.equal(false);
            expect(configuration.shouldExtractFile('file.ht')).to.equal(false);
            expect(configuration.shouldExtractFile('file.html.tmp')).to.equal(false);
            expect(configuration.shouldExtractFile('smth.html/file.txt')).to.equal(false);
        });

        it('should check *.htm, *.html, *.xhtml with value true', function() {
            configuration.load({
                extract: true
            });
            expect(configuration.shouldExtractFile('file.htm')).to.equal(true);
            expect(configuration.shouldExtractFile('file.html')).to.equal(true);
            expect(configuration.shouldExtractFile('file.xhtml')).to.equal(true);
            expect(configuration.shouldExtractFile('foo/file.htm')).to.equal(true);
            expect(configuration.shouldExtractFile('foo/file.html')).to.equal(true);
            expect(configuration.shouldExtractFile('foo/file.xhtml')).to.equal(true);

            expect(configuration.shouldExtractFile('file.txt')).to.equal(false);
            expect(configuration.shouldExtractFile('file.ht')).to.equal(false);
            expect(configuration.shouldExtractFile('file.html.tmp')).to.equal(false);
            expect(configuration.shouldExtractFile('smth.html/file.txt')).to.equal(false);
        });

        it('should set array of masks and also check *.htm, *.html, *.xhtml', function() {
            configuration.load({
                extract: ['foo', 'bar']
            });
            expect(configuration.shouldExtractFile('foo')).to.equal(true);
            expect(configuration.shouldExtractFile('bar')).to.equal(true);

            expect(configuration.shouldExtractFile('baz/foo')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/bar')).to.equal(false);

            expect(configuration.shouldExtractFile('file.htm')).to.equal(false);
            expect(configuration.shouldExtractFile('file.html')).to.equal(false);
            expect(configuration.shouldExtractFile('file.xhtml')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.htm')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.html')).to.equal(false);
            expect(configuration.shouldExtractFile('foo/file.xhtml')).to.equal(false);

            expect(configuration.shouldExtractFile('file.txt')).to.equal(false);
            expect(configuration.shouldExtractFile('file.ht')).to.equal(false);
            expect(configuration.shouldExtractFile('file.html.tmp')).to.equal(false);
            expect(configuration.shouldExtractFile('smth.html/file.txt')).to.equal(false);
        });
    });

    describe('usePlugin', function() {
        it('should run plugin with configuration specified', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.usePlugin(spy);
            expect(spy).to.have.not.callCount(0);
            expect(spy).to.have.callCount(1);
            expect(spy.getCall(0).args[0]).to.equal(configuration);
        });
    });

    describe('override', function() {
        it('should override `preset` setting', function() {
            configuration.registerPreset('1', {});
            configuration.registerPreset('2', {});
            configuration.override({preset: '2'});
            configuration.load({preset: '1'});
            expect(configuration.getProcessedConfig().preset).to.equal('2');
        });

        it('should override default preset', function() {
            configuration.registerDefaultRules();
            configuration.registerDefaultPresets();
            configuration.registerPreset('wikimedia', {});

            configuration.load({preset: 'wikimedia'});

            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should override `maxErrors` setting', function() {
            configuration.override({maxErrors: 2});
            configuration.load({maxErrors: 1});
            expect(configuration.getProcessedConfig().maxErrors).to.equal(2);
        });

        it('should override `maxErrors` setting from the preset', function() {
            configuration.registerPreset('test', {
                maxErrors: 1
            });

            configuration.override({maxErrors: 2});
            configuration.load({preset: 'test'});
            expect(configuration.getProcessedConfig().maxErrors).to.equal(2);
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
            expect(configuration.getProcessedConfig().ruleName).to.equal(true);
            expect(configureSpy).to.have.callCount(1);
            expect(configureSpy.getCall(0).args.length).to.equal(1);
            expect(configureSpy.getCall(0).args[0]).to.equal(true);
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
            expect(!configuration.getProcessedConfig().hasOwnProperty('ruleName')).to.equal(true);
            expect(configureSpy).to.have.callCount(0);
        });

        it('should not configure rule on false', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            var configureSpy = sinon.spy(rule, 'configure');
            configuration.registerRule(rule);
            configuration.load({ruleName: false});
            expect(!configuration.getProcessedConfig().hasOwnProperty('ruleName')).to.equal(true);
            expect(configureSpy).to.have.callCount(0);
        });

        it('should load `preset` options', function() {
            configuration.registerPreset('test', {maxErrors: 1});
            configuration.load({preset: 'test'});
            expect(configuration.getProcessedConfig().preset).to.equal('test');
            expect(configuration.getProcessedConfig().maxErrors).to.equal(1);
        });

        it('should load preset from the preset', function() {
            configuration.registerDefaultRules();
            configuration.registerPreset('test1', {
                es3: true,
                disallowMultipleVarDecl: true
            });
            configuration.registerPreset('test2', {
                maxErrors: 1,
                preset: 'test1',
                disallowMultipleVarDecl: 'exceptUndefined'
            });
            configuration.load({
                preset: 'test2'
            });
            expect(configuration.getProcessedConfig().preset).to.equal('test2');
            expect(configuration.getProcessedConfig().maxErrors).to.equal(1);
            expect(!!configuration.getProcessedConfig().es3).to.equal(true);

            expect(!!configuration.getConfiguredRules()[0]._exceptUndefined).to.equal(true);
        });

        it('should load nullify rule from the preset', function() {
            configuration.registerDefaultRules();
            configuration.registerPreset('test', {
                disallowMultipleVarDecl: true
            });
            configuration.load({
                preset: 'test',
                disallowMultipleVarDecl: null
            });
            expect(configuration.getProcessedConfig().preset).to.equal('test');
            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should not add duplicative values to list of unsupported rules', function() {
            configuration.registerPreset('test1', {
                es3: true,
                disallowMultipleVarDecl: true
            });
            configuration.registerPreset('test2', {
                maxErrors: 1,
                preset: 'test1',
                disallowMultipleVarDecl: 'exceptUndefined'
            });
            configuration.load({
                preset: 'test2'
            });
            expect(configuration.getUnsupportedRuleNames().length).to.equal(1);
        });

        it('should set `excludeFiles` setting from presets', function() {
            configuration.registerPreset('test1', {
                excludeFiles: ['first']
            });
            configuration.registerPreset('test2', {
                excludeFiles: ['second'],
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getExcludedFileMasks()[0]).to.equal('second');
            expect(configuration.getExcludedFileMasks()[1]).to.equal('first');
        });

        it('should set `excludeFiles` setting from preset', function() {
            configuration.registerPreset('test1', {
                excludeFiles: ['first']
            });
            configuration.registerPreset('test2', {
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getExcludedFileMasks()[0]).to.equal('first');
        });

        it('should set default `excludeFiles` if presets do not define their own', function() {
            configuration.registerPreset('test1', {});
            configuration.registerPreset('test2', {
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getExcludedFileMasks()).to.deep.equal(['.git/**', 'node_modules/**']);
        });

        describe('for settings with default value when preset is used #2275', function() {
            it('`excludeFiles`', function() {
                configuration.registerPreset('test1', {});
                configuration.load({
                    preset: 'test1',
                    excludeFiles: ['test']
                });

                expect(configuration.getExcludedFileMasks().length).to.equal(1);
                expect(configuration.getExcludedFileMasks()[0]).to.equal('test');
            });

            it('`fileExtensions`', function() {
                    configuration.registerPreset('test1', {});
                    configuration.load({
                        preset: 'test1',
                        fileExtensions: ['.test']
                    });

                    expect(configuration.getFileExtensions().length).to.equal(1);
                    expect(configuration.getFileExtensions()[0]).to.equal('.test');
                }
            );
        });

        it('should set `fileExtensions` setting from presets', function() {
            configuration.registerPreset('test1', {
                fileExtensions: ['first']
            });
            configuration.registerPreset('test2', {
                fileExtensions: ['second'],
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getFileExtensions()[0]).to.equal('second');
            expect(configuration.getFileExtensions()[1]).to.equal('first');
        });

        it('should set `fileExtensions` setting from preset', function() {
            configuration.registerPreset('test1', {
                fileExtensions: ['first']
            });
            configuration.registerPreset('test2', {
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getFileExtensions()[0]).to.equal('first');
        });

        it('should set default `fileExtensions` if presets do not define their own', function() {
            configuration.registerPreset('test1', {});
            configuration.registerPreset('test2', {
                preset: 'test1'
            });
            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getFileExtensions()[0]).to.equal('.js');
        });

        it('should not try go in infinite loop at circular preset references', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerRule(rule);

            configuration.registerPreset('test1', {
                ruleName: true,
                preset: 'test3'
            });
            configuration.registerPreset('test2', {
                maxErrors: 1,
                preset: 'test1'
            });
            configuration.registerPreset('test3', {
                preset: 'test2'
            });

            configuration.load({
                preset: 'test3'
            });

            expect(configuration.getConfiguredRules()[0].getOptionName()).to.equal('ruleName');
            expect(configuration.getProcessedConfig().maxErrors).to.equal(1);
        });

        it('should load preset from the preset with additional rule', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.registerPreset('test1', {
                es3: true,
                ruleName: 'test',
                additionalRules: [rule]
            });
            configuration.registerPreset('test2', {
                maxErrors: 1,
                preset: 'test1'
            });

            configuration.load({
                preset: 'test2'
            });

            expect(configuration.getProcessedConfig().preset).to.equal('test2');
            expect(configuration.getProcessedConfig().maxErrors).to.equal(1);
            expect(!!configuration.getProcessedConfig().es3).to.equal(true);
            expect(!!configuration.getProcessedConfig().ruleName).to.equal(true);
            expect(configuration.getUnsupportedRuleNames().length).to.equal(0);
        });

        it('should handle preset with custom rule which is not included', function() {
            configuration.registerPreset('test', {
                ruleName: 'test'
            });

            configuration.load({
                preset: 'test'
            });

            expect(!!configuration.getUnsupportedRuleNames()[ 0 ]).to.equal(true);
            expect(!('ruleName' in configuration.getProcessedConfig())).to.equal(true);
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
            expect(configuration.getProcessedConfig().preset).to.equal('preset');
            expect(configuration.getProcessedConfig().ruleName).to.equal(true);
        });

        it('should accept `excludeFiles`', function() {
            configuration.load({excludeFiles: ['**']});
            expect(configuration.getExcludedFileMasks().length).to.equal(1);
            expect(configuration.getExcludedFileMasks()[0]).to.equal('**');
        });

        it('should accept `fileExtensions` array', function() {
            configuration.load({fileExtensions: ['.jsx']});
            expect(configuration.getFileExtensions().length).to.equal(1);
            expect(configuration.getFileExtensions()[0]).to.equal('.jsx');
        });

        it('should accept `fileExtensions` string', function() {
            configuration.load({fileExtensions: '.jsx'});
            expect(configuration.getFileExtensions().length).to.equal(1);
            expect(configuration.getFileExtensions()[0]).to.equal('.jsx');
        });

        it('should accept `additionalRules` to register rules', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule]});
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.equal(rule);
            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should accept `additionalRules` to configure rules', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule], ruleName: true});
            expect(configuration.getConfiguredRules().length).to.equal(1);
            expect(configuration.getConfiguredRules()[0]).to.equal(rule);
        });

        it('should accept `configPath`', function() {
            configuration.load({configPath: 'app/1.js'});
            expect(configuration.getBasePath()).to.equal('app');
        });

        it('should not rewrite `basePath`', function() {
            configuration.load({configPath: 'first/1.js'});
            configuration.load({configPath: 'second/1.js'});
            expect(configuration.getBasePath()).to.equal('first');
        });

        it('should accept `plugins`', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.load({plugins: [spy]});
            expect(spy).to.have.not.callCount(0);
            expect(spy).to.have.callCount(1);
            expect(spy.getCall(0).args[0]).to.equal(configuration);
        });

        it('should set default excludeFiles option', function() {
            configuration.load({});
            expect(configuration.getExcludedFileMasks()).to.deep.equal(['.git/**', 'node_modules/**']);
        });

        it('should set default file extensions', function() {
            configuration.load({});
            expect(configuration.getFileExtensions().length).to.equal(1);
            expect(configuration.getFileExtensions()[0]).to.equal('.js');
        });

        it('should error on removed options in 3.0', function() {
            try {
                configuration.load({
                    esprima: true,
                    esprimaOptions: true,
                    verbose: true,
                    esnext: true
                });
            } catch (e) {
                expect(e.message).to.equal([
                    'Config values to remove in 3.0:',
                    'The `esprima` option since CST uses babylon (the babel parser) under the hood',
                    'The `esprimaOptions` option.',
                    'The `esnext` option is enabled by default.',
                    'The `verbose` option is enabled by default.'
                ].join('\n'));
            }
        });
    });
});
