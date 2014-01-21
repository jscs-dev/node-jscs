/**
 * Command line config file finder for JSCS.
 *
 */

var fs = require('fs');
var path = require('path');

function _cwd(cwd) {
    return cwd || process.cwd();
}

var conf = module.exports = {
    load: function (config, cwd) {
        var file = conf.find(config, _cwd(cwd));

        return file ? require(file) : false;
    },

    find: function (config, cwd) {
        var options = [ '.jscsrc', '.jscs.json' ];
        var found;

        cwd = _cwd(cwd);

        if (config) {
            options = [ config ];
        }

        options.some(function(entry) {
            entry = conf.resolve(entry, cwd);

            if (fs.existsSync(entry)) {
                found = entry;

                return true;
            }
        });

        return found;
    },

    resolve: function(config, cwd) {
        return path.resolve(_cwd(cwd), config);
    }
};
