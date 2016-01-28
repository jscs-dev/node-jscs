var utils = require('../../lib/utils');
var expect = require('chai').expect;
var JsFile = require('../../lib/js-file');
var path = require('path');

describe('utils', function() {

    function createJsFile(source) {
        return new JsFile({
            filename: 'example.js',
            source: source
        });
    }

    describe('isValidIdentifierName', function() {
        it('should return true for valid indentifier names', function() {
            expect(!!utils.isValidIdentifierName('validName1')).to.equal(true);
            expect(!!utils.isValidIdentifierName('validName')).to.equal(true);
            expect(!!utils.isValidIdentifierName('valid_Name')).to.equal(true);
            expect(!!utils.isValidIdentifierName('valid_Name_1')).to.equal(true);
            expect(!!utils.isValidIdentifierName('π')).to.equal(true);
            expect(!!utils.isValidIdentifierName('$')).to.equal(true);
            expect(!!utils.isValidIdentifierName('await', 'es5')).to.equal(true);
            expect(!!utils.isValidIdentifierName('𐊧', 'es6')).to.equal(true);
        });

        it('should return false for invalid indentifier names', function() {
            expect(!utils.isValidIdentifierName('1invalidName')).to.equal(true);
            expect(!utils.isValidIdentifierName('invalid-name')).to.equal(true);
            expect(!utils.isValidIdentifierName('await', 'es6')).to.equal(true);
            expect(!utils.isValidIdentifierName('double', 'es3')).to.equal(true);
            expect(!utils.isValidIdentifierName('𐊧', 'es5')).to.equal(true);
        });
    });

    describe('isSnakeCased', function() {
        it('should return true for snake cased', function() {
            expect(!!utils.isSnakeCased('valid_Name')).to.equal(true);
            expect(!!utils.isSnakeCased('valid_Name_1')).to.equal(true);
        });

        it('should return false for camel cased and others', function() {
            expect(!utils.isSnakeCased('invalidName1')).to.equal(true);
            expect(!utils.isSnakeCased('invalidName')).to.equal(true);
            expect(!utils.isSnakeCased('1invalidName')).to.equal(true);
            expect(!utils.isSnakeCased('invalid-name')).to.equal(true);
            expect(!utils.isSnakeCased('$')).to.equal(true);
        });
    });

    describe('getFunctionNodeFromIIFE', function() {
        it('should return the function from simple IIFE', function() {
            var file = createJsFile('var a = function(){a++;}();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            expect(utils.getFunctionNodeFromIIFE(callExpression)).to.equal(functionExpression);
        });

        it('should return the function from call()\'ed IIFE', function() {
            var file = createJsFile('var a = function(){a++;}.call();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            expect(utils.getFunctionNodeFromIIFE(callExpression)).to.equal(functionExpression);
        });

        it('should return the function from apply()\'ed IIFE', function() {
            var file = createJsFile('var a = function(){a++;}.apply();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            expect(utils.getFunctionNodeFromIIFE(callExpression)).to.equal(functionExpression);
        });

        it('should return undefined for non callExpressions', function() {
            var file = createJsFile('var a = 1;');
            var notCallExpression = file.getNodesByType('VariableDeclaration')[0];

            expect(utils.getFunctionNodeFromIIFE(notCallExpression)).to.equal(null);
        });

        it('should return undefined for normal function calls', function() {
            var file = createJsFile('call();');
            var callExpression = file.getNodesByType('CallExpression')[0];

            expect(utils.getFunctionNodeFromIIFE(callExpression)).to.equal(null);
        });
    });

    describe('trimUnderscores', function() {
        it('should trim trailing underscores', function() {
            expect(utils.trimUnderscores('__snake_cased')).to.equal('snake_cased');
            expect(utils.trimUnderscores('snake_cased__')).to.equal('snake_cased');
            expect(utils.trimUnderscores('__snake_cased__')).to.equal('snake_cased');
            expect(utils.trimUnderscores('__camelCased')).to.equal('camelCased');
            expect(utils.trimUnderscores('camelCased__')).to.equal('camelCased');
            expect(utils.trimUnderscores('__camelCased__')).to.equal('camelCased');
        });

        it('should not trim underscores for underscores only', function() {
            expect(utils.trimUnderscores('_')).to.equal('_');
            expect(utils.trimUnderscores('__')).to.equal('__');
        });
    });

    describe('isRelativePath', function() {
        it('returns true if the path is relative', function() {
            expect(!!utils.isRelativePath('../')).to.equal(true);
            expect(!!utils.isRelativePath('./')).to.equal(true);
        });

        it('returns false if the path is not relative', function() {
            expect(!utils.isRelativePath('path/to')).to.equal(true);
        });
    });

    describe('normalizePath', function() {
        var base = __dirname + '/bar/baz';

        it('returns the original path if it is not relative', function() {
            expect(utils.normalizePath('foo', base)).to.equal('foo');
        });

        it('returns the relative path resolved against the base path', function() {
            expect(utils.normalizePath('../foo', base)).to.equal(path.resolve(path.dirname(base), 'foo'));
        });
    });

    describe('promisify', function() {
        var resolveFn = function(data, cb) {
            cb(null, data);
        };
        var rejectFn = function(data, cb) {
            cb(new Error('foobar'), null);
        };

        it('returns a function that yields a promise', function() {
            var wrapped = utils.promisify(resolveFn);
            expect(wrapped(1).then).to.be.a('function');
        });

        it('resolves the promise when the node-style callback has no error', function(done) {
            var wrapped = utils.promisify(resolveFn);

            wrapped(1).then(function(data) {
                expect(data).to.equal(1);
                done();
            });
        });

        it('rejects the promise when the node-style callback has an error', function(done) {
            var wrapped = utils.promisify(rejectFn);
            wrapped(1).then(null, function(err) {
                expect(!!err).to.equal(true);
                done();
            });
        });
    });

    describe('isPragma', function() {
        it('returns true when string contains valid pragma (no additionalExceptions supplied)', function() {
            var isExcepted = utils.isPragma();
            expect(!!isExcepted(' jslint eqeqeq')).to.equal(true);
            expect(!!isExcepted('jslint eqeqeq')).to.equal(true);
            expect(!!isExcepted(' eslint eqeqeq')).to.equal(true);
            expect(!!isExcepted('eslint-enable')).to.equal(true);
            expect(!!isExcepted('jscs:ignore')).to.equal(true);
        });

        it('returns false when string doesn\'t contain valid pragma (no additionalExceptions supplied)', function() {
            var isExcepted = utils.isPragma();
            expect(!isExcepted('not valid')).to.equal(true);
            expect(!isExcepted('not global')).to.equal(true);
            expect(!isExcepted('globalized thing')).to.equal(true);
            expect(!isExcepted(' globalized thing ')).to.equal(true);
            expect(!isExcepted('jscs:awesome')).to.equal(true);
        });

        it('returns true when string contains valid pragma (additionalExceptions supplied)', function() {
            var isExcepted = utils.isPragma(['pragma', 'linter']);
            expect(!!isExcepted(' jslint eqeqeq')).to.equal(true);
            expect(!!isExcepted(' pragma eqeqeq')).to.equal(true);
            expect(!!isExcepted(' linter eqeqeq')).to.equal(true);
            expect(!!isExcepted('linter rule')).to.equal(true);
            expect(!!isExcepted('pragma rule')).to.equal(true);
        });

        it('returns false when string doesn\'t contain valid pragma (additionalExceptions supplied)', function() {
            var isExcepted = utils.isPragma(['pragma', 'linter']);
            expect(!isExcepted('not valid')).to.equal(true);
            expect(!isExcepted('not pragma')).to.equal(true);
            expect(!isExcepted('pragmatic string')).to.equal(true);
            expect(!isExcepted('linted code')).to.equal(true);
            expect(!isExcepted('splinter ')).to.equal(true);
        });
    });
});
