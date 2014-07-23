var Checker = require('../../lib/checker');
var configFile = require('../../lib/cli-config');
var assert = require('assert');
var Vow = require('vow');

describe('options/exclude-files', function() {
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

            return checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors === null);
            });
        });

        it('should allow patterns to match filenames starting with a period', function() {
            checker.configure({
                excludeFiles: ['test/data/configs/excludeFiles/**'],
                disallowKeywords: ['with']
            });

            return checker.checkFile('./test/data/configs/excludeFiles/.withdot/error.js').then(function(errors) {
                assert(errors === null);
            });
        });

        it('should resolve pattern to process.cwd', function() {
            var results = [];
            checker.configure({
                excludeFiles: ['test/data/exclude-files.js'],
                disallowKeywords: ['with']
            });

            // errors
            results.push(checker.checkFile('./test/data/configs/excludeFiles/script.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/script.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));

            return Vow.allResolved(results);
        });

        it('should resolve pattern to process.cwd', function() {
            var results = [];
            checker.configure({
                excludeFiles: ['test/data/exclude-files.js'],
                disallowKeywords: ['with']
            });

            // errors
            results.push(checker.checkFile('./test/data/configs/excludeFiles/script.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/script.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));

            return Vow.allResolved(results);
        });
    });

    describe('should resolve pattern relative to config file', function() {
        it('(pattern: *.js)', function() {
            var results = [];
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test1.jscs.json'));

            // ok
            results.push(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors === null);
            }));

            // errors
            results.push(checker.checkFile('./test/data/exclude-files.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js')
                .then(function(errors) {
                    assert(errors === null);
                })
            );

            return Vow.allResolved(results);
        });

        it('(pattern: exclude-files.js)', function() {
            var results = [];
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test2.jscs.json'));

            // ok
            results.push(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors === null);
            }));

            // errors
            results.push(checker.checkFile('./test/data/exclude-files.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js')
                .then(function(errors) {
                    assert(errors === null);
                })
            );

            return Vow.allResolved(results);
        });

        it('(pattern: */exclude-files.js)', function() {
            var results = [];
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test3.jscs.json'));

            // ok
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js')
                .then(function(errors) {
                    assert(errors === null);
                })
            );

            // errors
            results.push(checker.checkFile('./test/data/exclude-files.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));
            results.push(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));

            return Vow.allResolved(results);
        });

        it('(pattern: ../**/exclude-files.js)', function() {
            var results = [];
            checker.configure(configFile.load('./test/data/configs/excludeFiles/test4.jscs.json'));

            // ok
            results.push(checker.checkFile('./test/data/configs/excludeFiles/nested/exclude-files.js')
                .then(function(errors) {
                    assert(errors === null);
                })
            );
            results.push(checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors === null);
            }));

            // errors
            results.push(checker.checkFile('./test/data/exclude-files.js').then(function(errors) {
                assert(errors.getErrorList().length === 0);
            }));

            return Vow.allResolved(results);
        });
    });

    it('should be present in config after initialization', function() {
        checker.configure({
            excludeFiles: []
        });

        var config = checker.getProcessedConfig();

        assert(config.excludeFiles !== undefined);
        assert(Object.getOwnPropertyDescriptor(config, 'excludeFiles').enumerable === false);
    });
});
