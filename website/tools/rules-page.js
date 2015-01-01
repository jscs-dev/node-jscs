var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;
var through = require('through');
var processMarkdown = require('./process-markdown');
var jade = require('jade');
var path = require('path');

module.exports = function(jadeTemplateFilename, filename, variables) {
    var markdown = '';

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

        var match = fileContents.match(/^\/\*\*([\s\S]*?)\*\//m);
        if (match) {
            var doc = match[1];
            doc = doc.split('\n').map(function(line) {
                return line.replace(/^ \*(?: ?)/, '');
            }).join('\n');
            doc = doc.replace(/\*\\\//g, '*/');
            markdown += '### ' + optionName + '\n\n' + doc + '\n\n';
        }
    }

    function endStream() {
        variables.markdownHtml = processMarkdown(markdown);
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
