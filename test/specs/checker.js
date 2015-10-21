var fs = require('fs');
var expect = require('chai').expect;

var sinon = require('sinon');

var Checker = require('../../lib/checker');

describe('checker', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({
            disallowKeywords: ['with']
        });
    });

    describe('execute', function() {
        var stubs;

        beforeEach(function() {
            checker = new Checker();

            stubs = {
                check: sinon.stub(Checker.prototype, 'checkPath'),
                fix: sinon.stub(Checker.prototype, 'fixPath')
            };
        });

        afterEach(function() {
            stubs.check.restore();
            stubs.fix.restore();
        });

        it('should check', function() {
            checker.configure({});
            checker.execute();

            expect(stubs.check).to.be.called;
            expect(stubs.fix).to.not.be.called;
        });

        it('should fix', function() {
            checker.configure({ fix: true });
            checker.execute();

            expect(stubs.check).to.not.be.called;
            expect(stubs.fix).to.be.called;
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
                expect(errors).to.equal(null);
            });
        });
    });

    describe('checkDirectory', function() {
        it('should check sub dirs', function() {
            return checker.checkDirectory('./test/data/checker').then(function(errors) {
                expect(errors.length).to.equal(3);
            });
        });

        it('should return empty array for excluded dir', function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                disallowKeywords: ['with'],
                excludeFiles: ['./test/**']
            });
            return checker.checkDirectory('./test/data/checker').then(function(errors) {
                expect(!!Array.isArray(errors)).to.equal(true);
                expect(errors.length).to.equal(0);
            });
        });
    });

    describe('checkPath', function() {
        it('should check sub dirs', function() {
            return checker.checkPath('./test/data/checker').then(function(errors) {
                expect(errors.length).to.equal(3);
            });
        });

        it('should check file by direct link (#468)', function() {
            return checker.checkPath('./test/data/checker/without-extension').then(function(errors) {
                expect(errors.length).to.equal(1);
                expect(errors[0].getErrorList).to.be.a('function');
                expect(errors[0].getErrorList().length).to.equal(1);
            });
        });

        it('should throw for non-existent path', function() {
            return checker.checkPath('./non-existent').catch(function(e) {
                expect(e.message).to.equal('Path ./non-existent was not found.');
            });
        });

        it('should return empty results', function() {
            return checker.checkPath('./test/data/checker/empty.js').then(function(errors) {
                expect(errors.length).to.equal(1);
                expect(errors[0].getErrorList).to.be.a('function');
                expect(errors[0].getErrorList().length).to.equal(0);
            });
        });

        it('should throw an exception when path doesn\'t exists', function() {
            return checker.checkPath('./test/non-exists').then(function() {
                throw new Error();
            }, function() {});
        });

        it('should return empty array for excluded files', function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({
                disallowKeywords: ['with'],
                excludeFiles: ['./test/**']
            });
            return checker.checkPath('./test/data/checker/file.js').then(function(errors) {
                expect(!!Array.isArray(errors)).to.equal(true);
                expect(errors.length).to.equal(0);
            });
        });
    });

    describe('checkStdin', function() {
        it('should check stdin for input', function() {
            var spy = sinon.spy(process.stdin, 'on');

            checker.checkStdin();

            expect(spy).to.have.not.callCount(0);

            spy.restore();
        });

        it('returns a promise', function() {
            var spy = sinon.spy(process.stdin, 'on');

            expect(checker.checkStdin().then).to.be.a('function');

            spy.restore();
        });

        it('resolves with the errors from processing stdin', function(done) {
            checker.checkStdin().then(function(errors) {
                expect(errors).to.be.not.a('undefined');
                done();
            });

            process.stdin.emit('data', 'foo');
            process.stdin.emit('end');
        });
    });

    describe('extract', function() {
        it('should not extract anything by default', function() {
            return checker.checkPath('./test/data/extract').then(function(errors) {
                expect(errors.length).to.equal(0);
            });
        });

        it('should try extract js from any file', function() {
            checker.configure({
                extract: ['**']
            });

            return checker.checkPath('./test/data/extract').then(function(errors) {
                expect(errors.length).to.equal(4);
                expect(errors[0].getErrorList().length).to.equal(2);
                expect(errors[1].getErrorList().length).to.equal(2);
                expect(errors[2].getErrorList().length).to.equal(1);
                expect(errors[3].getErrorList().length).to.equal(0);
            });
        });

        it('extractFile should return empty error list if no errors', function() {
            var checker = new Checker();

            // no check rules no any errors
            checker.configure({
                extract: ['**']
            });

            return checker.extractFile('./test/data/extract/always.htm').then(function(errors) {
                expect(errors.getErrorList().length).to.equal(0);
            });
        });

        it('extractFile should return null if file doesn\'t check', function() {
            return checker.extractFile('./test/data/extract/always.htm').then(function(errors) {
                expect(errors).to.equal(null);
            });
        });

        describe('should take in account excludeFiles', function() {
            it('on checkPath', function() {
                checker.configure({
                    extract: ['**'],
                    excludeFiles: [
                        './test/**'
                    ]
                });

                return checker.checkPath('./test/data/extract').then(function(errors) {
                    expect(errors.length).to.equal(0);
                });
            });

            it('on extractFile', function() {
                checker.configure({
                    extract: ['**'],
                    excludeFiles: [
                        './test/**'
                    ]
                });

                return checker.extractFile('./test/data/extract/always.htm').then(function(errors) {
                    expect(errors).to.equal(null);
                });
            });
        });
    });

    describe('fixStdin', function() {
        it('should fix stdin input', function(done) {
            checker.configure({requireSpaceBeforeBinaryOperators: true, requireSpaceAfterBinaryOperators: true});
            checker.fixStdin().then(function(result) {
                expect(result.output).to.equal('x = y + 2;\nx -= 2;\n');
                done();
            });
            process.stdin.emit('data', 'x=y+2;\n');
            process.stdin.emit('data', 'x-=2;\n');
            process.stdin.emit('end');
        });

        it('returns a promise', function() {
            var spy = sinon.spy(process.stdin, 'on');
            expect(checker.fixStdin().then).to.be.a('function');
            spy.restore();
        });

        it('resolves with the errors from processing stdin', function(done) {
            checker.fixStdin().then(function(errors) {
                expect(errors).to.be.not.a('undefined');
                done();
            });

            process.stdin.emit('data', 'foo');
            process.stdin.emit('end');
        });
    });

    describe('fixing', function() {
        this.timeout(15000);

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
                    expect(errors).to.equal(null);
                });
            });

            it('should fix specified file', function() {
                checker.configure({
                    requireSpaceBeforeBinaryOperators: true,
                    requireSpaceAfterBinaryOperators: true,
                    requireSpaceAfterKeywords: ['if']
                });

                return checker.fixFile(tmpDir + '/spaces.js').then(function(errors) {
                    expect(errors).to.have.no.errors();
                    expect(fs.readFileSync(tmpDir + '/spaces.js', 'utf8'))
                      .to.equal('var y = 2;\nvar x = y + 1;\nif (x);');
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
                    expect(errors.length).to.equal(0);
                });
            });

            it('should fix specified file', function() {
                checker.configure({
                    requireSpaceBeforeBinaryOperators: true,
                    requireSpaceAfterBinaryOperators: true,
                    requireSpaceAfterKeywords: ['if']
                });

                return checker.fixPath(tmpDir).then(function(errorsCollection) {
                    expect(errorsCollection[0]).to.have.no.errors();
                    expect(fs.readFileSync(tmpDir + '/spaces.js', 'utf8'))
                      .to.equal('var y = 2;\nvar x = y + 1;\nif (x);');
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
                errorFilter: __dirname + '/../data/error-filter/index.js'
            });

            var errors = checker.checkString('var x = { "a": 1 }');

            expect(errors).to.have.no.errors();
        });
    });
});
