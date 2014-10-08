var assert = require('assert');
var sinon = require('sinon');
var Checker = require('../lib/checker');

describe('modules/checker', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({
            disallowKeywords: ['with']
        });
    });

    describe('checkFile', function() {
        afterEach(function() {
            if (checker._isExcluded.restore) {
                checker._isExcluded.restore();
            }
        });
        it('should check for exclusion', function() {
            sinon.spy(checker, '_isExcluded');

            checker.checkFile('./test/data/checker/file.js');

            assert(checker._isExcluded.called);
        });
        it('should return empty array of errors for excluded files', function() {
            sinon.stub(checker, '_isExcluded', function() {
                return true;
            });

            return checker.checkFile('./test/data/checker/file.js').then(function(errors) {
                assert(errors === null);
            });
        });
    });

    describe('checkDirectory', function() {
        it('should check sub dirs', function() {
            return checker.checkDirectory('./test/data/checker').then(function(errors) {
                assert(errors.length === 2);
            });
        });
    });

    describe('checkPath', function() {
        it('should check sub dirs', function() {
            return checker.checkPath('./test/data/checker').then(function(errors) {
                assert(errors.length === 2);
            });
        });

        it('should check file by direct link (#468)', function() {
            return checker.checkPath('./test/data/checker/without-extension').then(function(errors) {
                assert(errors.length === 1);
            });
        });
    });

    describe('checkStdin', function() {
        it('should check stdin for input', function() {
            var spy = sinon.spy(process.stdin, 'on');

            checker.checkStdin();

            assert(spy.called);
        });

        it('returns a promise', function() {
            var spy = sinon.spy(process.stdin, 'on');

            assert(typeof checker.checkStdin().then === 'function');
        });

        it('resolves with the errors from processing stdin', function(done) {
            checker.checkStdin().then(function(errors) {
                assert(typeof errors !== 'undefined');
                done();
            });

            process.stdin.emit('data', 'foo');
            process.stdin.emit('end');
        });
    });
});
