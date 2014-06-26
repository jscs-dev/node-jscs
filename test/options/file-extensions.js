var path = require('path');
var fs = require('fs');

var Checker = require('../../lib/checker');
var assert = require('assert');

describe('options/file-extensions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('default config', function() {
        beforeEach(function() {
            checker.configure({
                disallowKeywords: ['with']
            });
        });

        it('should not report any errors for non-matching extensions with default config', function() {
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') === null);
        });
        it('should report errors for matching extensions with default config', function() {
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') !== null);
        });
        it('should report errors for matching extensions (case insensitive) with default config', function() {
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions-2.jS') !== null);
        });
        it('should report errors for matching extensions (case insensitive) in directory with default config',
            function(done) {
                checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                    assert(errors.length === 2);
                    done();
                });
            }
        );
    });

    describe('custom config', function() {
        it('should not report any errors for non-matching extensions with custom config', function() {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') === null);
        });
        it('should report errors for matching extensions with custom config', function(done) {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 1);
                done();
            });
        });
        it('should report errors for matching extensions (case insensitive) with custom config', function(done) {
            checker.configure({
                fileExtensions: ['.JS'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions-2.jS') !== null);

            checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 2);
                done();
            });
        });
        it('should report errors for matching extensions (case insensitive) with string value', function(done) {
            checker.configure({
                fileExtensions: '.JS',
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions-2.jS') !== null);

            checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 2);
                done();
            });
        });
        it('should report errors for matching extensions with custom config with multiple extensions', function(done) {
            checker.configure({
                fileExtensions: ['.js', '.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 3);
                done();
            });
        });
        it('should report errors for matching extensions with Array *', function(done) {
            var testPath = './test/data/options/file-extensions';

            checker.configure({
                fileExtensions: ['*'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') !== null);

            checker.checkDirectory(testPath).then(function(errors) {
                assert(errors.length === fs.readdirSync(testPath).length);
                done();
            });
        });
        it('should report errors for matching extensions with string *', function(done) {
            var testPath = './test/data/options/file-extensions';

            checker.configure({
                fileExtensions: '*',
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') !== null);

            checker.checkDirectory(testPath).then(function(errors) {
                assert(errors.length === fs.readdirSync(testPath).length);
                done();
            });
        });

        it('should report errors for file whose fullname is the same as matching extension', function(done) {
            checker.configure({
                fileExtensions: 'file-extensions',
                disallowKeywords: ['with']
            });

            checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 1);
                done();
            });
        });
    });
});
