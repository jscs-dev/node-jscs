/**
 * Command line config file finder for JSCS.
 *
 */

var fs = require('fs');
var path = require('path');

// Configuration sources in priority order.
var options = ['package.json', '.jscsrc', '.jscs.json'];

function loadConfig(config, directory) {
    var configPath = path.resolve(directory, config);
    var content;

    if (fs.existsSync(configPath)) {
        content = require(configPath);
    }

    return content && config === 'package.json' ? content.jscsConfig : content;
}

exports.load = function(config, cwd) {
    var directory = cwd || process.cwd();

    // If config option is given, attempt to load it and return.
    if (config) {
        return loadConfig(config, directory);
    }

    // If no config option is given, attempt to load config files in order of priority.
    for (var i = 0, len = options.length; i < len; i++) {
        var content = loadConfig(options[i], directory);

        if (content) {
            return content;
        }
    }
};
