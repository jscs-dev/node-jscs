var expect = require('chai').expect;
var path = require('path');
var sinon = require('sinon');
var NodeConfiguration = require('../../../lib/config/node-configuration');

var AdditionalRule = require('../../data/rules/additional-rules');
var examplePluginSpy = require('../../data/plugin/plugin');

describe('modules/config/node-configuration', function() {
    var configuration;
    beforeEach(function() {
        configuration = new NodeConfiguration();
    });

    describe('constructor', function() {
        it('should set default base path to process.cwd()', function() {
            expect(configuration.getBasePath()).to.equal(process.cwd());
        });
    });

    describe('loadExternal', function() {
        it('should check type', function() {
            expect(configuration.loadExternal.bind(configuration, 1, 'test'))
              .to.throw('"test" option requires a string or null value');
        });

        it('should not load or throw if value is null', function() {
            expect(configuration.loadExternal(null)).to.equal(null);
        });

        it('should load relative path', function() {
            expect(configuration.loadExternal(
                    '../../data/plugin/plugin',
                    'plugin',
                    __filename
                )).to.be.a('function');
        });

        it('should load absolute path', function() {
            expect(
                configuration.loadExternal(
                    path.resolve('./test/data/plugin/plugin'),
                    'plugin'
                )
            ).to.be.a('function');
        });

        it('should load without "jscs" prefix node module', function() {
            expect(configuration.loadExternal('path')).to.be.a('object');
        });

        it('should load preset with "jscs-config" prefix', function() {
            var way = path.resolve('./test/data/configs/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('first-test', 'preset').test).to.equal(true);

            stub.restore();
        });

        it('should load preset with "jscs-preset" prefix', function() {
            var way = path.resolve('./test/data/configs/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('s-test', 'preset').test).to.equal(true);

            stub.restore();
        });

        it('should override default preset with module preset', function() {
            var way = path.resolve('./test/data/configs/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            configuration = new NodeConfiguration();

            configuration.registerDefaultRules();
            configuration.registerDefaultPresets();
            configuration.load({
                preset: 'wikimedia'
            });
            stub.restore();

            expect(configuration.getConfiguredRules().length).to.equal(0);
        });

        it('should load preset with "jscs-config" prefix without cwd', function() {
            var config = path.resolve('./test/data/configs/modules/config.json');

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('first-test', 'preset', config).test).to.equal(true);
        });

        it('should load preset with "jscs-preset" prefix without cwd', function() {
            var config = path.resolve('./test/data/configs/modules/config.json');

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('s-test', 'preset', config).test).to.equal(true);
        });

        it('should load error filter with prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('error-filter', 'errorFilter').test).to.equal(true);

            stub.restore();
        });

        it('should load error filter without prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            expect(!!configuration.loadExternal('jscs-error-filter', 'errorFilter').test).to.equal(true);

            stub.restore();
        });

        it('should not load error filter with incorrect prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            expect(configuration.loadExternal('filter', 'errorFilter')).to.equal(null);

            stub.restore();
        });
    });

    describe('overrideFromCLI', function() {
        it('should override allowed options from CLI', function() {
            configuration.overrideFromCLI({
                preset: 'jquery',
                maxErrors: '2',
                errorFilter: path.resolve(__dirname, '../../data/error-filter/index.js'),
                es3: true
            });

            configuration.registerPreset('jquery', {});
            configuration.load({});

            expect(configuration.getProcessedConfig().preset).to.equal('jquery');
            expect(configuration.getMaxErrors()).to.equal(2);
            expect(configuration.isES3Enabled()).to.equal(true);
            expect(configuration.getErrorFilter).to.be.a('function');
        });

        it('should not override disallowed options from CLI', function() {
            configuration.overrideFromCLI({
                fileExtensions: '.override'
            });

            configuration.load({});

            expect(configuration.getFileExtensions()).to.deep.equal(['.js']);
        });

        it('should not make a conflict between overrides and preset (#2087)', function() {
            configuration.registerPreset('jquery', {});

            configuration.overrideFromCLI({
                preset: 'jquery'
            });

            configuration.load({});

            expect(configuration.getFileExtensions()).to.deep.equal(['.js']);
        });
    });

    describe('load', function() {
        it('should load existing preset', function() {
            configuration.registerDefaultRules();
            configuration.registerPreset('test', {
                disallowMultipleVarDecl: 'exceptUndefined'
            });
            configuration.load({preset: 'test'});

            expect(!!configuration.getRegisteredRules()[0].getOptionName()).to.equal(true);
        });

        it('should load external preset', function() {
            configuration.registerDefaultRules();

            configuration.load({
                preset: path.resolve(__dirname + '/../../../presets/jquery.json')
            });

            var exist = false;
            configuration.getRegisteredRules().forEach(function(rule) {
                if (exist) {
                    return;
                }

                exist = rule.getOptionName() === 'requireCurlyBraces';
            });

            expect(!!exist).to.equal(true);
            expect(configuration.getPresetName()).to.equal('jquery');
        });

        it('should load external preset with .jscsrc extension', function() {
            configuration.registerDefaultRules();

            configuration.load({
                preset: path.resolve(__dirname + '/../../data/configs/jscsrc/external.jscsrc')
            });

            var exist = false;
            configuration.getRegisteredRules().forEach(function(rule) {
                if (exist) {
                    return;
                }

                exist = rule.getOptionName() === 'disallowKeywords';
            });

            expect(!!exist).to.equal(true);
            expect(configuration.getPresetName()).to.equal('external');
        });

        it('should load preset from preset', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-t-test/index.json')
            });

            expect(configuration.getPresetName()).to.equal('index');

            expect(configuration.getUnsupportedRuleNames().indexOf('one'))
              .to.not.equal(-1, 'should load rule from first preset');

            expect(configuration.getUnsupportedRuleNames().indexOf('second'))
              .to.not.equal(-1, 'should load rule from second preset');
        });

        it('should load preset json module', function() {
            configuration.load({
                preset: 'module/module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('module');
        });

        it('should load preset json module with different prefix', function() {
            configuration.load({
                preset: 'mod/module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('module');
        });

        it('should load preset js module', function() {
            configuration.load({
                preset: 'module/js-module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('module');
        });

        it('should load preset js module with different prefix', function() {
            configuration.load({
                preset: 'mod/js-module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('module');
        });

        it('should load preset module with extension', function() {
            configuration.load({
                preset: 'module/module.json',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('module');
        });

        it('should load preset', function() {
            configuration.load({
                preset: 'module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            expect(configuration.getUnsupportedRuleNames()[0]).to.equal('test');
        });

        it('should load "node_modules" preset from preset', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-preset-nm/index.json')
            });

            expect(configuration.getUnsupportedRuleNames().indexOf('test'))
              .to.not.equal(-1, 'should load rule from first preset');
        });

        it('should not rewrite rule from original preset', function() {
            configuration.registerRule({
                getOptionName: function() {
                    return 'one';
                },
                configure: function(config) {
                    this.value = config;
                }
            });

            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-t-test/index.json')
            });

            expect(configuration.getRegisteredRules()[0].getOptionName()).to.equal('one');
            expect(configuration.getRegisteredRules()[0].value).to.equal(true);
        });

        it('should load preset with custom rule', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-rule/index.json')
            });

            expect(configuration.getRegisteredRules()[0].getOptionName()).to.equal('test');
            expect(configuration.getRegisteredRules()[0].config).to.equal(true);
        });

        it('should load preset with plugin', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-plugin/index.json')
            });

            expect(configuration.getRegisteredRules()[0].getOptionName()).to.equal('test');
            expect(configuration.getRegisteredRules()[0].config).to.equal(true);
        });

        it('should load preset with errorFilter', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-filter/index.json')
            });

            expect(configuration.getErrorFilter()).to.be.a('function');
        });

        it('should throw if preset is missing', function() {
            configuration.registerDefaultRules();
            expect(configuration.load.bind(configuration, {
                    preset: 'not-exist'
                })).to.throw('Preset "not-exist" does not exist');
        });

        it('should accept `additionalRules` to register rule instances', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule]});
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.equal(rule);
        });

        it('should accept `additionalRules` to register rule paths', function() {
            configuration.load({
                additionalRules: ['./rules/additional-rules.js'],
                configPath: path.resolve(__dirname + '/../../data/config.json')
            });
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.be.an.instanceof(AdditionalRule);
        });

        it('should register additional rule with dot config (gh-1932)', function() {
            configuration.load({
                additionalRules: ['./success-rule.js'],
                configPath: path.resolve(__dirname + '/../../data/configs/additionalRules/gh-1932/.jscsrc')
            });
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0].getOptionName()).to.equal('successRule');
        });

        it('should register additional rule with dot config through glob pattern (gh-1932)', function() {
            configuration.load({
                additionalRules: ['./*.js'],
                configPath: path.resolve(__dirname + '/../../data/configs/additionalRules/gh-1932/.jscsrc')
            });
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0].getOptionName()).to.equal('successRule');
        });

        it('should accept `additionalRules` without "configPath" option', function() {
            configuration.load({
                additionalRules: ['./test/data/rules/*.js']
            });
            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.be.an.instanceof(AdditionalRule);
        });

        it('should accept `additionalRules` to register rule path masks', function() {
            configuration.load({
                additionalRules: ['./rules/*.js'],
                configPath: path.resolve(__dirname + '/../../data/config.json')
            });

            expect(configuration.getRegisteredRules().length).to.equal(1);
            expect(configuration.getRegisteredRules()[0]).to.be.an.instanceof(AdditionalRule);
        });

        it('should accept `plugins` to register plugin instance', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.load({plugins: [spy]});
            expect(spy).to.have.not.callCount(0);
            expect(spy).to.have.callCount(1);
            expect(spy.getCall(0).args[0]).to.equal(configuration);
        });

        it('should accept `plugins` to register plugin absolute path', function() {
            configuration.load({plugins: [path.resolve(__dirname + '/../../data/plugin/plugin')]});
            expect(examplePluginSpy).to.have.not.callCount(0);
            expect(examplePluginSpy).to.have.callCount(1);
            expect(examplePluginSpy.getCall(0).args[0]).to.equal(configuration);
            examplePluginSpy.reset();
        });

        it('should accept `plugins` to register plugin relative path', function() {
            configuration.load({
                configPath: path.resolve(__dirname + '/../../data/config.json'),
                plugins: ['./plugin/plugin']
            });
            expect(examplePluginSpy).to.have.not.callCount(0);
            expect(examplePluginSpy).to.have.callCount(1);
            expect(examplePluginSpy.getCall(0).args[0]).to.equal(configuration);
            examplePluginSpy.reset();
        });

        describe('error filter', function() {
            it('should accept `errorFilter` to register an error filter', function() {
                configuration.load({
                    errorFilter: path.resolve(__dirname, '../../data/error-filter/index.js')
                });

                expect(configuration.getErrorFilter()).to.be.a('function');
            });

            it('should accept `errorFilter` from node', function() {
                configuration.load({
                    errorFilter: 'stream'
                });

                expect(configuration.getErrorFilter()).to.be.a('function');
            });

            it('should accept `errorFilter` from node_modules', function() {
                configuration.load({
                    errorFilter: 'lodash'
                });

                expect(configuration.getErrorFilter()).to.be.a('function');
            });

            it('should not fail with a value of null', function() {
                expect(function() {
                    configuration.load({
                        errorFilter: null
                    });
                }).to.not.throw();
            });
        });
    });
});
