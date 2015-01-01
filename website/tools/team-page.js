var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');
var jade = require('jade');
var path = require('path');

module.exports = function(jadeTemplateFilename, filename, variables) {
    var maintainers = [];

    function processFile(file) {
        if (file.isNull()) {
            return;
        }
        if (file.isStream()) {
            return this.emit('error', new PluginError('jscs.info',  'Streaming not supported'));
        }

        var packageInfo = require(file.path);
        maintainers = maintainers.concat(packageInfo.maintainers);
    }

    function endStream() {
        variables.maintainers = maintainers;
        this.emit('data', new File({
            cwd: process.cwd(),
            base: __dirname,
            path: path.join(__dirname, filename),
            contents: new Buffer(jade.renderFile(jadeTemplateFilename, variables))
        }));
        this.emit('end');
    }

    return through(processFile, endStream);
};
