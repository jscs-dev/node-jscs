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

        it('should have 50 default error count', function() {
            expect(configuration.getMaxErrors()).to.equal(50);
        });

        it('should have no default preset', function() {
            expect(configuration.getPresetName()).to.equal(null);
        });

        it('should have no default custom esprima', function() {
            expect(configuration.hasCustomEsprima()).to.equal(false);
            expect(configuration.getCustomEsprima()).to.equal(null);
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

    describe('verbose', function() {
        it('should return false when null is specified', function() {
            configuration.load({verbose: null});
            expect(configuration.getVerbose()).to.equal(false);
        });

        it('should return false when false is specified', function() {
            configuration.load({verbose: false});
            expect(configuration.getVerbose()).to.equal(false);
        });

        it('should return true when unspecified', function() {
            configuration.load({});
            expect(configuration.getVerbose()).to.equal(false);
        });

        it('should return true when true is specified', function() {
            configuration.load({verbose: true});
            expect(configuration.getVerbose()).to.equal(true);
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

    describe('esprima', function() {
        it('should load custom esprima', function() {
            var fake = { parse: function() {} };
            configuration.load({
                esprima: fake
            });

            expect(!!configuration.hasCustomEsprima()).to.equal(true);
            expect(configuration.getCustomEsprima()).to.equal(fake);
        });

        it('should throw if esprima module do not have a "parse" method', function() {
            var fake = {};
            expect(configuration.load.bind(configuration, {esprima: fake})).to.throw();

            expect(configuration.hasCustomEsprima()).to.equal(false);
            expect(!configuration.getCustomEsprima()).to.equal(true);
        });

        it('should throw if errorFilter is not a function', function() {
            expect(configuration.load.bind(configuration, {errorFilter: {}}))
              .to.throw('`errorFilter` option requires a function or null value');
            expect(configuration.hasCustomEsprima()).to.equal(false);
            expect(!configuration.getCustomEsprima()).to.equal(true);
        });
    });

    describe('getEsprimaOptions', function() {
        function assertBadEsprimaOptions(esprimaOptions) {
            expect(function() {
                configuration.load({esprimaOptions: esprimaOptions});
            }).to.throw(/^AssertionError: `esprimaOptions` should be an object$/);
        }

        it('should accept `esprimaOptions` rule', function() {
            configuration.load({esprimaOptions: { foo: 'bar' }});
            expect(configuration.getUnsupportedRuleNames().length).to.equal(0);
        });

        it('should return the supplied esprima options', function() {
            configuration.load({esprimaOptions: { foo: 'bar' }});
            expect(configuration.getEsprimaOptions()).to.deep.equal({foo: 'bar'});
        });

        it('should reject null as the esprima options', function() {
            assertBadEsprimaOptions(null);
        });

        it('should reject booleans as the esprima options', function() {
            assertBadEsprimaOptions(true);
            assertBadEsprimaOptions(false);
        });

        it('should reject a number as the esprima options', function() {
            assertBadEsprimaOptions(42.7);
        });

        it('should reject a string as the esprima options', function() {
            assertBadEsprimaOptions('snafu');
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
            expect(!!configuration.hasPreset('yandex')).to.equal(true);
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
        it('should be check html files by default', function() {
            configuration.load({});
            expect(configuration.getExtractFileMasks()).to.deep.equal(['**/*.+(htm|html|xhtml)']);
        });

        it('should set array of masks', function() {
            configuration.load({
                extract: ['foo', 'bar']
            });
            expect(configuration.getExtractFileMasks()).to.deep.equal(['foo', 'bar']);
        });

        it('should set `never`', function() {
            configuration.load({
                extract: false
            });
            expect(configuration.getExtractFileMasks()).to.deep.equal([]);
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
        it('should be check *.htm, *.html, *.xhtml by default', function() {
            configuration.load({});
            expect(!!configuration.shouldExtractFile('file.htm')).to.equal(true);
            expect(!!configuration.shouldExtractFile('file.html')).to.equal(true);
            expect(!!configuration.shouldExtractFile('file.xhtml')).to.equal(true);
            expect(!!configuration.shouldExtractFile('foo/file.htm')).to.equal(true);
            expect(!!configuration.shouldExtractFile('foo/file.html')).to.equal(true);
            expect(!!configuration.shouldExtractFile('foo/file.xhtml')).to.equal(true);
            expect(!configuration.shouldExtractFile('file.txt')).to.equal(true);
            expect(!configuration.shouldExtractFile('file.ht')).to.equal(true);
            expect(!configuration.shouldExtractFile('file.html.tmp')).to.equal(true);
            expect(!configuration.shouldExtractFile('smth.html/file.txt')).to.equal(true);
        });

        it('should set array of masks', function() {
            configuration.load({
                extract: ['foo', 'bar']
            });
            expect(!!configuration.shouldExtractFile('foo')).to.equal(true);
            expect(!!configuration.shouldExtractFile('bar')).to.equal(true);
            expect(!configuration.shouldExtractFile('baz/foo')).to.equal(true);
            expect(!configuration.shouldExtractFile('foo/bar')).to.equal(true);
        });

        it('should set `never`', function() {
            configuration.load({
                extract: false
            });
            expect(!configuration.shouldExtractFile('file.html')).to.equal(true);
            expect(!configuration.shouldExtractFile('foo/file.html')).to.equal(true);
            expect(!configuration.shouldExtractFile('file.html.tmp')).to.equal(true);
            expect(!configuration.shouldExtractFile('smth.html/file.txt')).to.equal(true);
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

        it('should not try go in infinite loop at circular present references', function() {
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
                esnext: true,
                preset: 'test2'
            });

            configuration.load({
                preset: 'test3'
            });

            expect(configuration.getConfiguredRules()[0].getOptionName()).to.equal('ruleName');
            expect(!!configuration.getProcessedConfig().esnext).to.equal(true);
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

        it('should accept `maxErrors` number', function() {
            configuration.load({maxErrors: 1});
            expect(configuration.getMaxErrors()).to.equal(1);
        });

        it('should accept `maxErrors` null', function() {
            configuration.load({maxErrors: null});
            expect(configuration.getMaxErrors()).to.equal(null);
        });

        it('should accept `esnext` boolean (true)', function() {
            configuration.load({esnext: true});
            expect(configuration.isESNextEnabled()).to.equal(true);
        });

        it('should accept `esnext` boolean (false)', function() {
            configuration.load({esnext: false});
            expect(configuration.isESNextEnabled()).to.equal(false);
        });

        it('should accept `esnext` boolean (null)', function() {
            configuration.load({esnext: null});
            expect(configuration.isESNextEnabled()).to.equal(false);
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
    });
});
