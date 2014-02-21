var assert = require('assert');
var configFile = require('../lib/cli-config');

describe('cli-config', function() {
    describe('load', function() {
        it('should load a config from a package.json file', function() {
            var config = configFile.load('package.json', './test/data/configs/package');

            assert.equal(typeof config, 'object');
        });

        it('should ignore a package.json file if no config is found in it', function() {
            var config = configFile.load('package.json', './test/data/configs/emptyPackage');

            assert.equal(typeof config, 'undefined');
        });

        it('should load a config from a .jscs.json file', function() {
            var config = configFile.load('.jscs.json', './test/data/configs/json');

            assert.equal(typeof config, 'object');
        });

        it('should load a config from a .jscsrc file', function() {
            var config = configFile.load('.jscsrc', './test/data/configs/jscsrc');

            assert.equal(typeof config, 'object');
        });

        it('should load a .jscsrc config from a relative path', function() {
            var config = configFile.load('jscsrc/.jscsrc', './test/data/configs');

            assert.equal(config.from, 'jscsrc');
        });

        it('should load a custom config file', function() {
            var config = configFile.load('config.js', './test/data/configs/custom');

            assert.equal(typeof config, 'object');
        });

        it('should prefer package.json over .jscs.json and .jscsrc', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithPkg');

            assert.equal(typeof config, 'object');
            assert.equal(config.from, 'package.json');
        });

        it('should use another config source if package.json contains no config', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithEmptyPkg');

            assert.equal(config.from, '.jscsrc');
        });

        it('should prefer .jscsrc over .jscs.json', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithoutPkg');

            assert.equal(typeof config, 'object');
            assert.equal(config.from, '.jscsrc');
        });

        it('should not fall back to defaults if custom config is missing', function() {
            var config = configFile.load('custom.js', './test/data/configs/mixedWithPkg');

            assert.strictEqual(config, undefined);
        });
    });
});
