var path = require('path');
var assert = require('assert');
var configFile = require('../lib/cli-config');

describe('cli-config', function() {
    describe('resolve fn', function() {
        it('should call path.resolve(cwd, file)', function() {
            assert.equal(
                configFile.resolve('fooga.js', '/wooga/booga'),
                path.resolve('/wooga/booga', 'fooga.js')
            );
        });

        it('should use process.cwd() if no cwd value was passed', function() {
            assert.equal(
                configFile.resolve('fooga.js'),
                path.resolve(process.cwd(), 'fooga.js')
            );
        });
    });

    describe('find fn', function() {
        it('should find a .jscs.json config file on disk', function() {
            var file = configFile.find(null, './test/data/configs/json');

            assert(file.indexOf('.jscs.json') > -1);
        });

        it('should find a .jscsrc config file on disk', function() {
            var file = configFile.find(null, './test/data/configs/jscsrc');

            assert(file.indexOf('.jscsrc') > -1);
        });

        it('should find a custom config file on disk', function() {
            var file = configFile.find('config.js', './test/data/configs/custom');

            assert(file.indexOf('config.js') > -1);
        });

        it('should prefer .jscsrc over .jscs.json', function() {
            var file = configFile.find(null, './test/data/configs/mixed');

            assert(file.indexOf('.jscsrc') > -1);
        });

        it('should not fallback to defaults if custom config is missing', function() {
            var file = configFile.find('config.js', './test/data/configs/mixed');

            assert.equal(file, undefined);
        });
    });

    describe('load fn', function() {
        it('should require() a file off disk', function() {
            var config = configFile.load('config.js', './test/data/configs/custom');

            assert(typeof config === 'object');
        });

        it('should return false if the config can\'t be found', function() {
            var config = configFile.load(null, './test/data/configs/custom');

            assert.equal(config, false);
        });
    });
});
