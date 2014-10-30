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
        var pluginPath = plugin;
        if (isRelativeRequirePath(pluginPath)) {
            pluginPath = path.resolve(this._basePath, pluginPath);
        }
        plugin = require(pluginPath);
    }
    Configuration.prototype._loadPlugin.call(this, plugin);
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

function isRelativeRequirePath(requirePath) {
    // Logic from: https://github.com/joyent/node/blob/4f1ae11a62b97052bc83756f8cb8700cc1f61661/lib/module.js#L237
    var start = requirePath.substring(0, 2);
    return start === './' || start === '..';
}

module.exports = NodeConfiguration;
