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
    'es3',
    'verbose',
    'esnext'
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
 * [loadExternal description]
 * @param {String|null} external - path (relative or absolute) or name to the external module
 * @param {String} type - type of the module
 * @return {Module}
 */
NodeConfiguration.prototype.loadExternal = function(external, type) {
    assert(
        typeof external === 'string' || external === null,
        '"' + type + '" option requires a string or null value'
    );

    if (external) {
        return require(
            utils.normalizePath(external, this._basePath)
        );

    } else {
        return null;
    }
};

/**
 * Loads plugin data.
 *
 * @param {String|null|Function} plugin
 * @protected
 */
NodeConfiguration.prototype._loadPlugin = function(plugin) {
    if (typeof plugin !== 'function') {
        plugin = this.loadExternal(plugin, 'plugin');
    }

    return Configuration.prototype._loadPlugin.call(this, plugin);
};

/**
 * Loads an error filter module
 *
 * @param {String|null} filter
 * @protected
 */
NodeConfiguration.prototype._loadErrorFilter = function(filter) {
    Configuration.prototype._loadErrorFilter.call(
        this,
        this.loadExternal(filter, 'errorFilter')
    );
};

/**
 * Loads a custom esprima.
 *
 * @param {String|null} esprima
 * @protected
 */
NodeConfiguration.prototype._loadEsprima = function(esprima) {
    Configuration.prototype._loadEsprima.call(
        this,
        this.loadExternal(esprima, 'esprima')
    );
};

/**
 * Loads additional rule.
 *
 * @param {String|Rule} additionalRule
 * @protected
 */
NodeConfiguration.prototype._loadAdditionalRule = function(additionalRule) {
    if (typeof additionalRule === 'string') {
        if(glob.hasMagic(additionalRule)) {
            glob.sync(path.resolve(this._basePath, additionalRule)).forEach(function(path) {
                var Rule = require(path);
                Configuration.prototype._loadAdditionalRule.call(this, new Rule());
            }, this);
        } else {
            var Rule = this.loadExternal(additionalRule);
            Configuration.prototype._loadAdditionalRule.call(this, new Rule());
        }
    } else {
        Configuration.prototype._loadAdditionalRule.call(this, additionalRule);
    }
};

module.exports = NodeConfiguration;
