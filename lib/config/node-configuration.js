var path = require('path');
var util = require('util');
var utils = require('../utils');
var glob = require('glob');
var Configuration = require('./configuration');
var assert = require('assert');

var OVERRIDE_OPTIONS = [
    'preset',
    'maxErrors',
    'errorFilter',
    'esprima',
    'es3'
];

/**
 * nodejs-compatible configuration module.
 *
 * @name NodeConfiguration
 * @augments Configuration
 * @constructor
 */
function NodeConfiguration() {
    Configuration.call(this);
    this._basePath = process.cwd();
}

util.inherits(NodeConfiguration, Configuration);

/**
 * Overrides configuration with options specified by the CLI
 *
 * @param {Object} program
 */
NodeConfiguration.prototype.overrideFromCLI = function(program) {
    var overrides = {};

    OVERRIDE_OPTIONS.forEach(function(option) {
        if (program[option]) {
            overrides[option] = program[option];
        }
    });

    this.override(overrides);
};

/**
 * Loads plugin data.
 *
 * @param {String|function(Configuration)} plugin
 * @protected
 */
NodeConfiguration.prototype._loadPlugin = function(plugin) {
    if (typeof plugin === 'string') {
        var pluginPath = utils.normalizePath(plugin, this._basePath);
        plugin = require(pluginPath);
    }
    Configuration.prototype._loadPlugin.call(this, plugin);
};

/**
 * Loads an error filter module
 *
 * @param {String|null} errorFilter
 * @protected
 */
NodeConfiguration.prototype._loadErrorFilter = function(errorFilter) {
    assert(
        typeof errorFilter === 'string' || errorFilter === null,
        '`errorFilter` option requires a string or null value'
    );

    if (errorFilter) {
        errorFilter = utils.normalizePath(errorFilter, this._basePath);
        errorFilter = require(errorFilter);
    }

    Configuration.prototype._loadErrorFilter.call(this, errorFilter);
};

/**
 * Loads a custom esprima.
 *
 * @param {String|null} esprima
 * @protected
 */
NodeConfiguration.prototype._loadEsprima = function(esprima) {
    assert(
        typeof esprima === 'string' || esprima === null,
        '`esprima` option requires a string or null value'
    );

    if (esprima) {
        esprima = utils.normalizePath(esprima, this._basePath);
        esprima = require(esprima);
    }

    Configuration.prototype._loadEsprima.call(this, esprima);
};

/**
 * Loads additional rule.
 *
 * @param {String|Rule} additionalRule
 * @protected
 */
NodeConfiguration.prototype._loadAdditionalRule = function(additionalRule) {
    if (typeof additionalRule === 'string') {
        glob.sync(path.resolve(this._basePath, additionalRule)).forEach(function(path) {
            var Rule = require(path);
            Configuration.prototype._loadAdditionalRule.call(this, new Rule());
        }, this);
    } else {
        Configuration.prototype._loadAdditionalRule.call(this, additionalRule);
    }
};

module.exports = NodeConfiguration;
