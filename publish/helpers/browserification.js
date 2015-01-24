var fs = require('fs');
var path = require('path');

var browserify = require('browserify')({
    standalone: 'JscsStringChecker'
});

var browserPath = path.resolve(__dirname, '../../jscs-browser.js');
var stringCheckerPath = path.resolve(__dirname, '../../lib/string-checker.js');

module.exports = {
    create: function() {
        browserify.add(stringCheckerPath);

        browserify.bundle().pipe(fs.createWriteStream(browserPath));
    },

    remove: function() {
        fs.unlinkSync(browserPath);
    }
};
