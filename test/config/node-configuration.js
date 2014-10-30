var assert = require('assert');
var path = require('path');
var sinon = require('sinon');
var NodeConfiguration = require('../../lib/config/node-configuration');

var AdditionalRule = require('../data/rules/additional-rules');
var examplePluginSpy = require('../data/plugin/plugin');

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

    describe('load', function() {
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
                additionalRules: ['rules/additional-rules.js'],
                configPath: path.resolve(__dirname + '/../data/config.json')
            });
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] instanceof AdditionalRule);
        });

        it('should accept `additionalRules` to register rule path masks', function() {
            configuration.load({
                additionalRules: ['rules/*.js'],
                configPath: path.resolve(__dirname + '/../data/config.json')
            });
            assert(configuration.getRegisteredRules().length === 1);
            assert(configuration.getRegisteredRules()[0] instanceof AdditionalRule);
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
            configuration.load({plugins: [path.resolve(__dirname + '/../data/plugin/plugin')]});
            assert(examplePluginSpy.called);
            assert(examplePluginSpy.callCount === 1);
            assert(examplePluginSpy.getCall(0).args[0] === configuration);
            examplePluginSpy.reset();
        });

        it('should accept `plugins` to register plugin relative path', function() {
            configuration.load({
                configPath: path.resolve(__dirname + '/../data/config.json'),
                plugins: ['./plugin/plugin']
            });
            assert(examplePluginSpy.called);
            assert(examplePluginSpy.callCount === 1);
            assert(examplePluginSpy.getCall(0).args[0] === configuration);
            examplePluginSpy.reset();
        });
    });
});
