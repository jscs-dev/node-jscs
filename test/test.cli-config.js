var assert = require('assert');
var config = require('../lib/cli-config');

describe('cli-config', function() {
    it('should find a .jscs.json config file on disk', function() {
        var file = config(null, './test/data/configs/json');

        assert(file.indexOf('.jscs.json') > -1);
    });

    it('should find a .jscsrc config file on disk', function() {
        var file = config(null, './test/data/configs/jscsrc');

        assert(file.indexOf('.jscsrc') > -1);
    });

    it('should find a custom config file on disk', function() {
        var file = config('config.js', './test/data/configs/custom');

        assert(file.indexOf('config.js') > -1);
    });

    it('should prefer .jscsrc over .jscs.json', function() {
        var file = config(null, './test/data/configs/mixed');

        assert(file.indexOf('.jscsrc') > -1);
    });
});
