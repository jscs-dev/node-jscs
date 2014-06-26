var fs = require('fs');
var path = require('path');

fs.unlinkSync(path.resolve(__dirname, '../jscs-browser.js'));
