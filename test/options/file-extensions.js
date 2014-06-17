var path = require('path');

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
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') === null);
        });
        it('should report errors for matching extensions with default config', function() {
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
        });
        it('should report errors for matching extensions (case insensitive) with default config', function() {
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions-2.jS') !== null);
        });
        it('should report errors for matching extensions (case insensitive) in directory with default config', function(done) {
            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 2);
                done();
            });
        });
    });

    describe('custom config', function() {
        it('should not report any errors for non-matching extensions with custom config', function() {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') === null);
        });
        it('should report errors for matching extensions with custom config', function(done) {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 1);
                done();
            });
        });
        it('should report errors for matching extensions (case insensitive) with custom config', function(done) {
            checker.configure({
                fileExtensions: ['.JS'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions-2.jS') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 2);
                done();
            });
        });
        it('should report errors for matching extensions (case insensitive) with string value', function(done) {
            checker.configure({
                fileExtensions: '.JS',
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions-2.jS') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 2);
                done();
            });
        });
        it('should report errors for matching extensions with custom config with multiple extensions', function(done) {
            checker.configure({
                fileExtensions: ['.js', '.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 3);
                done();
            });
        });
        it('should report errors for matching extensions with Array *', function(done) {
            checker.configure({
                fileExtensions: ['*'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 3);
                done();
            });
        });
        it('should report errors for matching extensions with string *', function(done) {
            checker.configure({
                fileExtensions: '*',
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);

            checker.checkDirectory('./test/data/configs/fileExtensions').then(function(errors) {
                assert(errors.length === 3);
                done();
            });
        });
    });
});
