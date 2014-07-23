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

        it('should report errors for matching extensions (case insensitive) in directory with default config',
            function() {
                return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                    assert(errors.length === 2);
                });
            }
        );
    });

    describe('custom config', function() {
        it('should report errors for matching extensions with custom config', function() {
            checker.configure({
                fileExtensions: ['.jsx'],
                disallowKeywords: ['with']
            });

            return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 1);
            });
        });
        it('should report errors for matching extensions (case insensitive) with custom config', function() {
            checker.configure({
                fileExtensions: ['.JS'],
                disallowKeywords: ['with']
            });

            return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 2);
            });
        });
        it('should report errors for matching extensions (case insensitive) with string value', function() {
            checker.configure({
                fileExtensions: '.JS',
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions-2.jS') !== null);

            return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 2);
            });
        });
        it('should report errors for matching extensions with custom config with multiple extensions', function() {
            checker.configure({
                fileExtensions: ['.js', '.jsx'],
                disallowKeywords: ['with']
            });

            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.js') !== null);
            assert(checker.checkFile('./test/data/options/file-extensions/file-extensions.jsx') !== null);

            return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 3);
            });
        });
        it('should report errors for matching extensions with Array *', function() {
            var testPath = './test/data/options/file-extensions';

            checker.configure({
                fileExtensions: ['*'],
                disallowKeywords: ['with']
            });

            return checker.checkDirectory(testPath).then(function(errors) {
                assert(errors.length === fs.readdirSync(testPath).length);
            });
        });
        it('should report errors for matching extensions with string *', function() {
            var testPath = './test/data/options/file-extensions';

            checker.configure({
                fileExtensions: '*',
                disallowKeywords: ['with']
            });

            return checker.checkDirectory(testPath).then(function(errors) {
                assert(errors.length === fs.readdirSync(testPath).length);
            });
        });

        it('should report errors for file whose fullname is the same as matching extension', function() {
            checker.configure({
                fileExtensions: 'file-extensions',
                disallowKeywords: ['with']
            });

            return checker.checkDirectory('./test/data/options/file-extensions').then(function(errors) {
                assert(errors.length === 1);
            });
        });
    });

    it('should should be present in config after initialization', function() {
        checker.configure({
            fileExtensions: 'test'
        });

        var config = checker.getProcessedConfig();

        assert(config.fileExtensions !== undefined);
        assert(Object.getOwnPropertyDescriptor(config, 'fileExtensions').enumerable === false);
    });
});
