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
        it('should not report any errors', function(done) {
            checker.configure({
                excludeFiles: ['test/data/configs/excludeFiles/exclude-files.js'],
                disallowKeywords: ['with']
            });

            checker.checkFile('./test/data/configs/excludeFiles/exclude-files.js').then(function(errors) {
                assert(errors === null);
                done();
            });
        });

        it('should allow patterns to match filenames starting with a period', function(done) {
            checker.configure({
                excludeFiles: ['test/data/configs/excludeFiles/**'],
                disallowKeywords: ['with']
            });

            checker.checkFile('./test/data/configs/excludeFiles/.withdot/error.js').then(function(errors) {
                assert(errors === null);
                done();
            });
        });

        it('should resolve pattern to process.cwd', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });

        it('should resolve pattern to process.cwd', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });
    });

    describe('should resolve pattern relative to config file', function(done) {
        it('(pattern: *.js)', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });

        it('(pattern: exclude-files.js)', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });

        it('(pattern: */exclude-files.js)', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });

        it('(pattern: ../**/exclude-files.js)', function(done) {
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

            Vow.allResolved(results).then(function() {
                done();
            });
        });
    });

});
