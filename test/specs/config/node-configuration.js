var assert = require('assert');
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
            assert(configuration.getBasePath() === process.cwd());
        });
    });

    describe('loadExternal', function() {
        it('should check type', function() {
            assert.throws(
                configuration.loadExternal.bind(configuration, 1, 'test'),
                'test option requires a string or null value'
            );
        });

        it('should not load or throw if value is null', function() {
            assert.equal(configuration.loadExternal(null), null);
        });

        it('should load relative path', function() {
            assert.equal(
                typeof configuration.loadExternal(
                    '../../data/plugin/plugin',
                    'plugin',
                    __filename
                ),
                'function'
            );
        });

        it('should load absolute path', function() {
            assert.equal(
                typeof configuration.loadExternal(
                    path.resolve('./test/data/plugin/plugin'),
                    'plugin'
                ),
                'function'
            );
        });

        it('should load without "jscs" prefix node module', function() {
            assert.equal(
                typeof configuration.loadExternal('path'),
                'object'
            );
        });

        it('should load preset with "jscs-config" prefix', function() {
            var way = path.resolve('./test/data/configs/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('first-test', 'preset').test);

            stub.restore();
        });

        it('should load preset with "jscs-preset" prefix', function() {
            var way = path.resolve('./test/data/configs/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('s-test', 'preset').test);

            stub.restore();
        });

        it('should load preset with "jscs-config" prefix without cwd', function() {
            var config = path.resolve('./test/data/configs/modules/config.json');

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('first-test', 'preset', config).test);
        });

        it('should load preset with "jscs-preset" prefix without cwd', function() {
            var config = path.resolve('./test/data/configs/modules/config.json');

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('s-test', 'preset', config).test);
        });

        it('should load error filter with prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('error-filter', 'errorFilter').test);

            stub.restore();
        });

        it('should load error filter without prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            assert(configuration.loadExternal('jscs-error-filter', 'errorFilter').test);

            stub.restore();
        });

        it('should not load error filter with incorrect prefix', function() {
            var way = path.resolve('./test/data/error-filter/modules');
            var stub = sinon.stub(process, 'cwd');

            stub.returns(way);

            var configuration = new NodeConfiguration();
            assert.equal(configuration.loadExternal('filter', 'errorFilter'), null);

            stub.restore();
        });
    });

    describe('overrideFromCLI', function() {
        it('should override allowed options from CLI', function() {
            configuration.overrideFromCLI({
                preset: 'jquery',
                maxErrors: '2',
                errorFilter: path.resolve(__dirname, '../../data/error-filter/index.js'),
                esprima: 'babel-jscs',
                es3: true,
                verbose: true,
                esnext: true
            });

            configuration.registerPreset('jquery', {});
            configuration.load({});

            assert.equal(configuration.getProcessedConfig().preset, 'jquery');
            assert.equal(configuration.getMaxErrors(), 2);
            assert.equal(configuration.isES3Enabled(), true);
            assert.equal(typeof configuration.getErrorFilter, 'function');
            assert.equal(configuration.hasCustomEsprima(), true);
            assert.equal(configuration.getVerbose(), true);
            assert.equal(configuration.isESNextEnabled(), true);
        });

        it('should not override disallowed options from CLI', function() {
            configuration.overrideFromCLI({
                fileExtensions: '.override'
            });

            configuration.load({});

            assert.deepEqual(configuration.getFileExtensions(), ['.js']);
        });
    });

    describe('load', function() {
        it('should load existing preset', function() {
            configuration.registerDefaultRules();
            configuration.registerPreset('test', {
                disallowMultipleVarDecl: 'exceptUndefined'
            });
            configuration.load({preset: 'test'});

            assert(configuration.getRegisteredRules()[0].getOptionName(), 'exceptUndefined');
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

            assert(exist);
            assert.equal(configuration.getPresetName(), 'jquery');
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

            assert(exist);
            assert.equal(configuration.getPresetName(), 'external');
        });

        it('should try to load preset from node', function() {
            configuration.registerDefaultRules();
            configuration.load({
                preset: 'path'
            });

            assert.equal(configuration.getPresetName(), 'path');
            assert(configuration.getUnsupportedRuleNames().indexOf('resolve') > -1);
        });

        it('should try to load preset from node_modules', function() {
            configuration.registerDefaultRules();
            configuration.load({
                preset: 'sinon'
            });

            assert.equal(configuration.getPresetName(), 'sinon');
            assert(configuration.getUnsupportedRuleNames().indexOf('spy') > -1);
        });

        it('should load preset from preset', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-t-test/index.json')
            });

            assert.equal(configuration.getPresetName(), 'index');

            assert(
                configuration.getUnsupportedRuleNames().indexOf('one') !== -1,
                'should load rule from first preset'
            );

            assert(
                configuration.getUnsupportedRuleNames().indexOf('second') !== -1,
                'should load rule from second preset'
            );
        });

        it('should load preset json module', function() {
            configuration.load({
                preset: 'module/module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'module');
        });

        it('should load preset json module with different prefix', function() {
            configuration.load({
                preset: 'mod/module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'module');
        });

        it('should load preset js module', function() {
            configuration.load({
                preset: 'module/js-module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'module');
        });

        it('should load preset js module with different prefix', function() {
            configuration.load({
                preset: 'mod/js-module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'module');
        });

        it('should load preset module with extension', function() {
            configuration.load({
                preset: 'module/module.json',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'module');
        });

        it('should load preset', function() {
            configuration.load({
                preset: 'module',
                configPath: path.resolve(__dirname + '/../../data/configs/modules/non-existent.json')
            });

            assert.equal(configuration.getUnsupportedRuleNames()[0], 'test');
        });

        it('should load "node_modules" preset from preset', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-preset-nm/index.json')
            });

            assert(
                configuration.getUnsupportedRuleNames().indexOf('test') !== -1,
                'should load rule from first preset'
            );
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

            assert.equal(configuration.getRegisteredRules()[0].getOptionName(), 'one');
            assert.equal(configuration.getRegisteredRules()[0].value, true);
        });

        it('should load preset with custom esprima', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-esprima/index.json')
            });

            assert(typeof configuration.getCustomEsprima().parse === 'function');
        });

        it('should load preset with custom rule', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-rule/index.json')
            });

            assert.equal(configuration.getRegisteredRules()[0].getOptionName(), 'test');
            assert.equal(configuration.getRegisteredRules()[0].config, true);
        });

        it('should load preset with plugin', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-plugin/index.json')
            });

            assert.equal(configuration.getRegisteredRules()[0].getOptionName(), 'test');
            assert.equal(configuration.getRegisteredRules()[0].config, true);
        });

        it('should load preset with errorFilter', function() {
            configuration.load({
                preset: path.resolve('./test/data/configs/modules/node_modules/jscs-filter/index.json')
            });

            assert(typeof configuration.getErrorFilter() === 'function');
        });

        it('should throw if preset is missing', function() {
            configuration.registerDefaultRules();
            assert.throws(
                configuration.load.bind(configuration, {
                    preset: 'not-exist'
                }),
                'Preset "not-exist" does not exist'
            );
        });

        it('should try to load preset from node_modules', function() {
            configuration.registerDefaultRules();
            configuration.load({
                preset: 'sinon'
            });

            assert.equal(configuration.getPresetName(), 'sinon');
            assert(configuration.getUnsupportedRuleNames().indexOf('spy') > -1);
        });

        it('should accept `additionalRules` to register rule instances', function() {
            var rule = {
                getOptionName: function() {
                    return 'ruleName';
                },
                configure: function() {}
            };
            configuration.load({additionalRules: [rule]});
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] === rule);
        });

        it('should accept `additionalRules` to register rule paths', function() {
            configuration.load({
                additionalRules: ['./rules/additional-rules.js'],
                configPath: path.resolve(__dirname + '/../../data/config.json')
            });
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] instanceof AdditionalRule);
        });

        it('should accept `additionalRules` to register rule path masks', function() {
            configuration.load({
                additionalRules: ['./rules/*.js'],
                configPath: path.resolve(__dirname + '/../../data/config.json')
            });

            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] instanceof AdditionalRule);
        });

        it('should accept `esprima` to register different esprima', function() {
            configuration.load({
                esprima: 'babel-jscs'
            });

            assert.equal(configuration.hasCustomEsprima(), true);
        });

        it('should accept `plugins` to register plugin instance', function() {
            var plugin = function() {};
            var spy = sinon.spy(plugin);
            configuration.load({plugins: [spy]});
            assert(spy.called);
            assert(spy.callCount === 1);
            assert(spy.getCall(0).args[0] === configuration);
        });

        it('should accept `plugins` to register plugin absolute path', function() {
            configuration.load({plugins: [path.resolve(__dirname + '/../../data/plugin/plugin')]});
            assert(examplePluginSpy.called);
            assert(examplePluginSpy.callCount === 1);
            assert(examplePluginSpy.getCall(0).args[0] === configuration);
            examplePluginSpy.reset();
        });

        it('should accept `plugins` to register plugin relative path', function() {
            configuration.load({
                configPath: path.resolve(__dirname + '/../../data/config.json'),
                plugins: ['./plugin/plugin']
            });
            assert(examplePluginSpy.called);
            assert(examplePluginSpy.callCount === 1);
            assert(examplePluginSpy.getCall(0).args[0] === configuration);
            examplePluginSpy.reset();
        });

        describe('esprima', function() {
            it('should get esprima', function() {
                configuration.load({
                    esprima: 'esprima'
                });

                assert(typeof configuration.getCustomEsprima() === 'object');
            });
        });

        describe('error filter', function() {
            it('should accept `errorFilter` to register an error filter', function() {
                configuration.load({
                    errorFilter: path.resolve(__dirname, '../../data/error-filter/index.js')
                });

                assert(typeof configuration.getErrorFilter() === 'function');
            });

            it('should accept `errorFilter` from node', function() {
                configuration.load({
                    errorFilter: 'stream'
                });

                assert(typeof configuration.getErrorFilter() === 'function');
            });

            it('should accept `errorFilter` from node_modules', function() {
                configuration.load({
                    errorFilter: 'browserify'
                });

                assert(typeof configuration.getErrorFilter() === 'function');
            });

            it('should not fail with a value of null', function() {
                assert.doesNotThrow(function() {
                    configuration.load({
                        errorFilter: null
                    });
                });
            });
        });
    });
});
