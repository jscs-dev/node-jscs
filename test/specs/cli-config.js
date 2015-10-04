var path = require('path');

var expect = require('chai').expect;
var rewire = require('rewire');

var configFile = rewire('../../lib/cli-config');

describe('cli-config', function() {
    describe('load method', function() {
        it('should load a config from a package.json file', function() {
            var config = configFile.load('package.json', './test/data/configs/package');

            expect(config).to.be.a('object');
        });

        it('should ignore a package.json file if no config is found in it', function() {
            var config = configFile.load('package.json', './test/data/configs/emptyPackage');

            expect(config).to.be.a('undefined');
        });

        it('should load a config from a .jscs.json file', function() {
            var config = configFile.load('.jscs.json', './test/data/configs/json');

            expect(config).to.be.a('object');
        });

        it('should load a config from a .jscs.yaml file', function() {
            var config = configFile.load('.jscs.yaml', './test/data/configs/yaml');

            expect(config).to.be.a('object');
            expect(config.type).to.equal('yaml');
        });

        it('should load a JSON config from a .jscsrc file', function() {
            var config = configFile.load('.jscsrc', './test/data/configs/jscsrc');

            expect(config).to.be.a('object');
        });

        it('should load a YAML config from a .jscsrc file', function() {
            var config = configFile.load('.jscsrc', './test/data/configs/yaml');

            expect(config).to.be.a('object');
            expect(config.type).to.equal('yaml');
        });

        it('should load a config from upper .jscsrc file', function() {
            var config = configFile.load(null, './test/data/configs/jscsrc/empty');

            expect(config).to.be.a('object');
            expect(config.from).to.equal('jscsrc');
        });

        it('should load a .jscsrc config from a relative path', function() {
            var config = configFile.load('jscsrc/.jscsrc', './test/data/configs');

            expect(config.from).to.equal('jscsrc');
        });

        it('should load a custom config file', function() {
            var config = configFile.load('config.js', './test/data/configs/custom');

            expect(config.from).to.equal('js');
        });

        it('should prefer package.json over .jscs.json and .jscsrc', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithPkg');

            expect(config).to.be.a('object');
            expect(config.from).to.equal('package.json');
        });

        it('should use another config source if package.json contains no config', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithEmptyPkg');

            expect(config.from).to.equal('.jscsrc');
        });

        it('should prefer .jscsrc over .jscs.json', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithoutPkg');

            expect(config).to.be.a('object');
            expect(config.from).to.equal('.jscsrc');
        });

        it('should not fall back to defaults if custom config is missing', function() {
            var config = configFile.load('custom.js', './test/data/configs/mixedWithPkg');

            expect(config).to.equal(undefined);
        });

        it('should load config from lower .jscsrc file instead of package.json', function() {
            var config = configFile.load(null, './test/data/configs/mixedWithUpperPkg/jscsrc');

            expect(config.from).to.equal('.jscsrc');
        });

        it('should fail load json config with comments', function() {
            try {
                configFile.load('./test/data/configs/json/withComments.json');
                throw new Error();
            } catch (e) {
            }
        });

        it('should load json config with BOM', function() {
            try {
                configFile.load('./test/data/configs/json/withBOM.json');
            } catch (e) {
                throw new Error();
            }
        });

        it('should load config from home path: HOME', function() {
            var oldHome = process.env.HOME;
            var oldHOMEPATH = process.env.HOMEPATH;
            var oldUSERPROFILE = process.env.USERPROFILE;

            process.env.HOMEPATH = process.env.USERPROFILE = null;
            process.env.HOME = './test/data/configs/jscsrc';
            expect(configFile.load(null, '/').from).to.equal('jscsrc');
            process.env.HOME = oldHome;
            process.env.HOMEPATH = oldHOMEPATH;
            process.env.USERPROFILE = oldUSERPROFILE;
        });

        it('should load a config from the available home path: HOMEPATH', function() {
            var oldHome = process.env.HOME;
            var oldHOMEPATH = process.env.HOMEPATH;
            var oldUSERPROFILE = process.env.USERPROFILE;

            delete process.env.USERPROFILE;
            delete process.env.HOME;

            process.env.HOMEPATH = './test/data/configs/jscsrc';
            expect(configFile.load(null, '/').from).to.equal('jscsrc');
            process.env.HOME = oldHome;
            process.env.HOMEPATH = oldHOMEPATH;
            process.env.USERPROFILE = oldUSERPROFILE;
        });

        it('should load a config from the available home path: USERPROFILE', function() {
            var oldHome = process.env.HOME;
            var oldHOMEPATH = process.env.HOMEPATH;
            var oldUSERPROFILE = process.env.USERPROFILE;

            process.env.HOME = process.env.HOMEPATH = null;
            process.env.USERPROFILE = './test/data/configs/jscsrc';
            expect(configFile.load(null, '/').from).to.equal('jscsrc');
            process.env.HOME = oldHome;
            process.env.HOMEPATH = oldHOMEPATH;
            process.env.USERPROFILE = oldUSERPROFILE;
        });
    });

    describe('getContent method', function() {
        it('should get content from node module', function() {
            var config = configFile.getContent('path');

            expect(config).to.be.a('object');
        });

        it('should get content from "node_modules"', function() {
            var dir = path.resolve('./test/data/configs/modules');
            var config = configFile.getContent('test', path.resolve('./test/data/configs/modules'));

            expect(config.configPath).to.equal(path.join(dir, 'node_modules/test/index.json'));
            expect(!!config.test).to.equal(true);
        });
    });

    describe('getReporter method', function() {
        it('should get console reporter if called without arguments', function() {
            var reporter = configFile.getReporter();

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./lib/reporters/console'));
        });

        it('should get console reporter if called with arguments with default values', function() {
            var reporter = configFile.getReporter(undefined, true);

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./lib/reporters/console'));
        });

        it('should get text reporter if called with colors = false', function() {
            var reporter = configFile.getReporter(undefined, false);

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./lib/reporters/text'));
        });

        it('should get junit reporter with the name', function() {
            var reporter = configFile.getReporter('junit');

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./lib/reporters/junit'));
        });

        it('should get reporter with partial path', function() {
            var reporter = configFile.getReporter('./test/data/reporter/test-reporter.js');

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./test/data/reporter/test-reporter.js'));
        });

        it('should get null instead of function if reporter does not exist', function() {
            var reporter = configFile.getReporter('./test');

            expect(reporter.writer).to.equal(null);
            expect(reporter.path).to.equal(path.resolve('./test'));
        });

        it('should get text reporter if tty does not support colors', function() {
            var old = configFile.__get__('supportsColor');

            configFile.__set__('supportsColor', false);

            var reporter = configFile.getReporter();

            expect(reporter.writer).to.be.a('function');
            expect(reporter.path).to.equal(path.resolve('./lib/reporters/text'));

            configFile.__set__('supportsColor', old);
        });

        it('should fake reporter from node', function() {
            var reporter = configFile.getReporter('path');

            expect(reporter.writer).to.be.a('object');
            expect(reporter.path).to.equal('path');
        });

        it('should fake reporter from node_modules', function() {
            var reporter = configFile.getReporter('sinon');

            expect(reporter.writer).to.be.a('object');
            expect(reporter.path).to.equal('sinon');
        });
    });
});
