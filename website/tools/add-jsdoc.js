var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');
var path = require('path');
var fs = require('fs');

module.exports = function(readmeFilename) {
    var readmeData = fs.readFileSync(readmeFilename);

    function processFile(file) {
        if (file.isNull()) {
            return;
        }
        if (file.isStream()) {
            return this.emit('error', new PluginError('jscs.info',  'Streaming not supported'));
        }

        var RuleClass = require(file.path);
        var ruleInstance = new RuleClass();
        var optionName = ruleInstance.getOptionName();

        var fileContents = file.contents.toString();

        var regex = new RegExp('\n###\\s*' + optionName + '([\\s\\S]*?)(?:\n###[^#]|\n##[^#])', 'm');

        var match = regex.exec(readmeData);
        if (match) {
            var ruleInfo = match[1].trim();
            ruleInfo = ruleInfo.replace(/\*\//g, '*\\/');
            fileContents = '/**' + ruleInfo.split('\n').map(function(line) {
                return '\n ' + ('* ' + line).trim();
            }).join('') + '\n */\n\n' + fileContents;
        } else {
            console.log(optionName + ' was not processed');
        }

        this.emit('data', new File({
            cwd: file.cwd,
            base: file.base,
            path: file.path,
            contents: new Buffer(fileContents)
        }));
    }

    function endStream() {
        this.emit('end');
    }

    return through(processFile, endStream);
};
