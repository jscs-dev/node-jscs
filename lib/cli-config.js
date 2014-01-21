/**
 * Command line config file finder for JSCS.
 *
 */

var fs = require('fs');
var path = require('path');

module.exports = function(config, cwd) {
    var options = [ '.jscsrc', '.jscs.json' ];
    var found;

    if (config) {
        options.unshift(config);
    }

    options.some(function(entry) {
        entry = path.resolve(cwd, entry);

        if (fs.existsSync(entry)) {
            found = entry;

            return true;
        }
    });

    return found;
};
