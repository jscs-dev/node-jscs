/**
 * Command line config file finder for JSCS.
 *
 */

var fs = require('fs');
var path = require('path');
var stripJSONComments = require('strip-json-comments');
var findup = require('findup-sync');

// Configuration sources in priority order.
var configs = ['.jscsrc', '.jscs.json'];

exports.getContent = function(config, directory) {
    if (!config) {
        return;
    }

    var configPath = path.resolve(directory, config);
    var content;

    config = path.basename(config);

    if (fs.existsSync(configPath)) {
        if (config === '.jscsrc') {
            content = JSON.parse(
                stripJSONComments(
                    fs.readFileSync(configPath, 'utf8')
                )
            );
        } else {
            content = require(configPath);
        }

        // Adding property via Object.defineProperty makes it
        // non-enumerable and avoids warning for unsupported rules
        Object.defineProperty(content, 'configPath', {
            value: configPath
        });
    }

    return content && config === 'package.json' ? content.jscsConfig : content;
};

exports.load = function(config, cwd) {
    var content;
    var directory = cwd || process.cwd();

    // If config option is given, attempt to load it and return.
    if (config) {
        return this.getContent(config, directory);
    }

    // Try to load config from package.json first
    content = this.getContent(
        findup('package.json', { nocase: true, cwd: directory })
    );

    if (content) {
        return content;
    }

    // Try to load standart configs
    content = this.getContent(
        findup(configs, { nocase: true, cwd: directory })
    );

    if (content) {
        return content;
    }

    // Try to load standart configs from home dir
    directory = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    for (var i = 0, len = configs.length; i < len; i++) {
        content = this.getContent(configs[i], directory);

        if (content) {
            return content;
        }
    }
};
