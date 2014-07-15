var fs = require('fs');
var path = require('path');

var readmePath = path.resolve(__dirname, '../../README.md');
var tmpPath = path.resolve(__dirname, 'tmp-README.md');

var replaceString = '\n\n**This is a documentation for the development version,' +
    ' please refer to the https://www.npmjs.org/package/jscs instead**';

module.exports = {
    replace: function() {
        var readme = {
            original: fs.readFileSync(readmePath, 'utf8'),
            publish: ''
        };

        if (readme.original.indexOf(replaceString) < 0) {
            console.error('There is no string to remove from README.md');
            process.exit(1);
        }
        readme.publish = readme.original.replace(replaceString, '');

        fs.writeFileSync(tmpPath, readme.original);
        fs.writeFileSync(readmePath, readme.publish);
    },

    restore: function() {
        fs.writeFileSync(readmePath, fs.readFileSync(tmpPath));
        fs.unlinkSync(tmpPath);
    }
};
