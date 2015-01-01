var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');
var processMarkdown = require('./process-markdown');
var jade = require('jade');
var path = require('path');

module.exports = function(jadeTemplateFilename, filename, variables) {
    var markdownHtml = '';

    function processFile(file) {
        if (file.isNull()) {
            return;
        }
        if (file.isStream()) {
            return this.emit('error', new PluginError('jscs.info',  'Streaming not supported'));
        }

        markdownHtml += processMarkdown(file.contents.toString());
    }

    function endStream() {
        variables.markdownHtml = markdownHtml;
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
