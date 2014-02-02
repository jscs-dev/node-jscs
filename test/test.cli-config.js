var assert = require('assert');
var configFile = require('../lib/cli-config');

describe('cli-config', function() {
    describe('resolve cwd', function () {
        it('should call process.cwd() when no argument is given', function () {
            assert.equal(configFile.getCwd(), process.cwd());
        });

        it('should use a path if one is given as an argument', function () {
            assert.equal(configFile.getCwd('/a/b/c'), '/a/b/c');
        });
    });

    describe('load', function () {
        it('should load a config from a package.json file', function () {
            var config = configFile.load('package.json', './test/data/configs/package');

            assert.equal(typeof config, 'object');
        });

        it('should load a config from a .jscs.json file', function () {
            var config = configFile.load('.jscs.json', './test/data/configs/json');

            assert.equal(typeof config, 'object');
        });

        it('should load a config from a .jscsrc file', function () {
            var config = configFile.load('.jscsrc', './test/data/configs/jscsrc');

            assert.equal(typeof config, 'object');
        });

        it('should load a custom config file', function () {
            var config = configFile.load('config.js', './test/data/configs/custom');

            assert.equal(typeof config, 'object');
        });

        it('should prefer package.json over .jscs.json and .jscsrc', function () {
            var config = configFile.load(null, './test/data/configs/mixedWithPkg');

            assert.equal(typeof config, 'object');
            assert.equal(config.from, 'package.json');
        });

        it('should prefer .jscsrc over .jscs.json', function () {
            var config = configFile.load(null, './test/data/configs/mixedWithoutPkg');

            assert.equal(typeof config, 'object');
            assert.equal(config.from, '.jscsrc');
        });

        it('should not fall back to defaults if custom config is missing', function () {
            var config = configFile.load('custom.js', './test/data/configs/mixedWithPkg');

            assert.strictEqual(config, undefined);
        });
    });
});
