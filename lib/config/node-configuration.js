var path = require('path');
var util = require('util');
var glob = require('glob');
var Configuration = require('./configuration');

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
 * Loads plugin data.
 *
 * @param {String|function(Configuration)} plugin
 * @protected
 */
NodeConfiguration.prototype._loadPlugin = function(plugin) {
    if (typeof plugin === 'string') {
        plugin = require(plugin);
    }
    Configuration.prototype._loadPlugin.call(this, plugin);
};

/**
 * Loads additional rule.
 *
 * @param {string|Rule} additionalRule
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
