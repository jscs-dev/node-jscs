var assert = require('assert');
var sinon = require('sinon');
var Checker = require('../../lib/checker');
var fs = require('fs');

describe('checker', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({
            disallowKeywords: ['with']
        });
    });

    describe('checkFile', function() {
        it('should return empty array of errors for excluded files', function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                disallowKeywords: ['with'],
                excludeFiles: ['./test/**']
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

            spy.restore();
        });

        it('returns a promise', function() {
            var spy = sinon.spy(process.stdin, 'on');

            assert(typeof checker.checkStdin().then === 'function');

            spy.restore();
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

    describe('fixStdin', function() {
        it('should fix stdin input', function(done) {
            checker.configure({requireSpaceBeforeBinaryOperators: true, requireSpaceAfterBinaryOperators: true});
            checker.fixStdin().then(function(result) {
                assert.equal(result.output, 'x = y + 2;\nx -= 2;\n');
                done();
            });
            process.stdin.emit('data', 'x=y+2;\n');
            process.stdin.emit('data', 'x-=2;\n');
            process.stdin.emit('end');
        });

        it('returns a promise', function() {
            var spy = sinon.spy(process.stdin, 'on');
            assert(typeof checker.fixStdin().then === 'function');
            spy.restore();
        });

        it('resolves with the errors from processing stdin', function(done) {
            checker.fixStdin().then(function(errors) {
                assert(typeof errors !== 'undefined');
                done();
            });

            process.stdin.emit('data', 'foo');
            process.stdin.emit('end');
        });
    });

    describe('fixing', function() {
        var sourceDir = __dirname + '/../data/autofixing';
        var tmpDir = __dirname + '/../data/autofixing-tmp';

        beforeEach(function() {
            fs.mkdirSync(tmpDir);
            fs.writeFileSync(tmpDir + '/spaces.js', fs.readFileSync(sourceDir + '/spaces.js', 'utf8'));
        });

        afterEach(function() {
            fs.unlinkSync(tmpDir + '/spaces.js');
            fs.rmdirSync(tmpDir);
        });

        describe('fixFile', function() {
            it('should return empty array of errors for excluded files', function() {
                checker = new Checker();
                checker.registerDefaultRules();
                checker.configure({
                    disallowKeywords: ['with'],
                    excludeFiles: ['**']
                });
                return checker.fixFile(tmpDir + '/spaces.js').then(function(errors) {
                    assert(errors === null);
                });
            });

            it('should fix specified file', function() {
                checker.configure({
                    requireSpaceBeforeBinaryOperators: true,
                    requireSpaceAfterBinaryOperators: true,
                    requireSpaceAfterKeywords: ['if']
                });

                return checker.fixFile(tmpDir + '/spaces.js').then(function(errors) {
                    assert.equal(errors.getErrorCount(), 0);
                    assert.equal(
                        fs.readFileSync(tmpDir + '/spaces.js', 'utf8'),
                        'var y = 2;\nvar x = y + 1;\nif (x);'
                    );
                });
            });
        });

        describe('fixPath', function() {
            it('should return empty array of errors for excluded files', function() {
                checker = new Checker();
                checker.registerDefaultRules();
                checker.configure({
                    disallowKeywords: ['with'],
                    excludeFiles: ['**']
                });
                return checker.fixPath(tmpDir).then(function(errors) {
                    assert.equal(errors.length, 0);
                });
            });

            it('should fix specified file', function() {
                checker.configure({
                    requireSpaceBeforeBinaryOperators: true,
                    requireSpaceAfterBinaryOperators: true,
                    requireSpaceAfterKeywords: ['if']
                });

                return checker.fixPath(tmpDir).then(function(errorsCollection) {
                    assert.equal(errorsCollection[0].getErrorCount(), 0);
                    assert.equal(
                        fs.readFileSync(tmpDir + '/spaces.js', 'utf8'),
                        'var y = 2;\nvar x = y + 1;\nif (x);'
                    );
                });
            });
        });
    });

    describe('error filter', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
        });

        it('should accept a path to a filter function to filter out errors', function() {
            checker.configure({
                disallowQuotedKeysInObjects: true,
                errorFilter: __dirname + '/../data/error-filter.js'
            });

            var errors = checker.checkString('var x = { "a": 1 }');

            assert.ok(errors.isEmpty());
        });
    });
});
