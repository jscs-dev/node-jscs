var Checker = require('../lib/checker');
var configFile = require('../lib/cli-config');
var assert = require('assert');

describe('excludeFiles option', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('use config in script', function() {
        it('should not report any errors', function() {
            checker.configure({
                excludeFiles: ['test/data/configs/excludeFiles/exclude-files.js'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js') === null);
        });

        it('should allow patterns to match filenames starting with a period', function() {
            checker.configure({
                excludeFiles: ['test/data/configs/excludeFiles/**'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/excludeFiles/.withdot/error.js') === null);
        });

        it('should resolve pattern to process.cwd', function() {
            checker.configure({
                excludeFiles: ['test/data/exclude-files.js'],
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/excludeFiles/script.js') !== null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/script.js') !== null);
        });

        it('should resolve pattern to process.cwd', function() {
            checker.configure({
                excludeFiles: ['test/data/exclude-files.js'],
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/excludeFiles/script.js') !== null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/script.js') !== null);
        });
    });

    describe('should resolve pattern relative to config file', function() {
        it('(pattern: *.js)', function() {
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test1.jscs.json'));

            // ok
            assert(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js') === null);

            // errors
            assert(checker.checkFile('./test/data/exclude-files.js') !== null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js') !== null);
        });

        it('(pattern: exclude-files.js)', function() {
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test2.jscs.json'));

            // ok
            assert(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js') === null);

            // errors
            assert(checker.checkFile('./test/data/exclude-files.js') !== null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js') !== null);
        });

        it('(pattern: */exclude-files.js)', function() {
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test3.jscs.json'));

            // ok
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js') === null);

            // errors
            assert(checker.checkFile('./test/data/exclude-files.js') !== null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js') !== null);
        });

        it('(pattern: ../**/exclude-files.js)', function() {
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test4.jscs.json'));

            // ok
            assert(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js') === null);
            assert(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js') === null);

            // errors
            assert(checker.checkFile('./test/data/exclude-files.js') !== null);
        });
    });

});
