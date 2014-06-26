var fs = require('fs');
var path = require('path');

var browserify = require('browserify')();

browserify.add(path.resolve(__dirname, '../lib/string-checker.js'));

browserify.bundle({
    standalone: 'JscsStringChecker'
}).pipe(fs.createWriteStream(path.resolve(__dirname, '../jscs-browser.js')));
