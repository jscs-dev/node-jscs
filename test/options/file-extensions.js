var Checker = require('../../lib/checker');
var assert = require('assert');

describe('options/file-extensions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('default config', function() {

        it('should not report any errors for non-matching extensions with default config', function() {
            checker.configure({
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') === null);
        });

        it('should report errors for matching extensions with default config', function() {
            checker.configure({
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
        });

        it('should report errors for matching extensions (case insensitive) with default config', function() {
            checker.configure({
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions-2.jS') !== null);
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

        it('should report errors for matching extensions with custom config', function() {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);
        });

        it('should report errors for matching extensions (case insensitive) with custom config', function() {
            checker.configure({
                fileExtensions: ['.JS'],
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions-2.jS') !== null);
        });

        it('should report errors for matching extensions with custom config with multiple extensions', function() {
            checker.configure({
                fileExtensions: ['.js', '.jsx'],
                disallowKeywords: ['with']
            });

            // errors
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/configs/fileExtensions/file-extensions.jsx') !== null);
        });
    });

});
