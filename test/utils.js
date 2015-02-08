var utils = require('../lib/utils');
var assert = require('assert');
var JsFile = require('../lib/js-file');
var esprima = require('esprima');
var path = require('path');

describe('modules/utils', function() {

    function createJsFile(source) {
        return new JsFile(
            'example.js',
            source,
            esprima.parse(source, {loc: true, range: true, comment: true, tokens: true})
        );
    }

    describe('isEs3Keyword', function() {
        it('should return true for ES3 keywords', function() {
            assert(utils.isEs3Keyword('break'));
        });

        it('should return false for ES3 future reserved words', function() {
            assert(!utils.isEs3Keyword('abstract'));
        });

        it('should return false for non keywords', function() {
            assert(!utils.isEs3Keyword('blah'));
        });
    });

    describe('isEs3FutureReservedWord', function() {
        it('should return true for ES3 future reserved words', function() {
            assert(utils.isEs3FutureReservedWord('abstract'));
        });

        it('should return false for ES3 keywords', function() {
            assert(!utils.isEs3FutureReservedWord('break'));
        });

        it('should return false for non future reserved words', function() {
            assert(!utils.isEs3FutureReservedWord('blah'));
        });
    });

    describe('isValidIdentifierName', function() {
        it('should return true for valid indentifier names', function() {
            assert(utils.isValidIdentifierName('validName1'));
            assert(utils.isValidIdentifierName('validName'));
            assert(utils.isValidIdentifierName('valid_Name'));
            assert(utils.isValidIdentifierName('valid_Name_1'));
            assert(utils.isValidIdentifierName('$'));
        });

        it('should return false for invalid indentifier names', function() {
            assert(!utils.isValidIdentifierName('1invalidName'));
            assert(!utils.isValidIdentifierName('invalid-name'));
        });
    });

    describe('isSnakeCased', function() {
        it('should return true for snake cased', function() {
            assert(utils.isSnakeCased('valid_Name'));
            assert(utils.isSnakeCased('valid_Name_1'));
        });

        it('should return false for camel cased and others', function() {
            assert(!utils.isSnakeCased('invalidName1'));
            assert(!utils.isSnakeCased('invalidName'));
            assert(!utils.isSnakeCased('1invalidName'));
            assert(!utils.isSnakeCased('invalid-name'));
            assert(!utils.isSnakeCased('$'));
        });
    });

    describe('getFunctionNodeFromIIFE', function() {
        it('should return the function from simple IIFE', function() {
            var file = createJsFile('var a = function(){a++;}();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            assert.equal(utils.getFunctionNodeFromIIFE(callExpression), functionExpression);
        });

        it('should return the function from call()\'ed IIFE', function() {
            var file = createJsFile('var a = function(){a++;}.call();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            assert.equal(utils.getFunctionNodeFromIIFE(callExpression), functionExpression);
        });

        it('should return the function from apply()\'ed IIFE', function() {
            var file = createJsFile('var a = function(){a++;}.apply();');
            var callExpression = file.getNodesByType('CallExpression')[0];
            var functionExpression = file.getNodesByType('FunctionExpression')[0];

            assert.equal(utils.getFunctionNodeFromIIFE(callExpression), functionExpression);
        });

        it('should return undefined for non callExpressions', function() {
            var file = createJsFile('var a = 1;');
            var notCallExpression = file.getNodesByType('VariableDeclaration')[0];

            assert.equal(utils.getFunctionNodeFromIIFE(notCallExpression), undefined);
        });

        it('should return undefined for normal function calls', function() {
            var file = createJsFile('call();');
            var callExpression = file.getNodesByType('CallExpression')[0];

            assert.equal(utils.getFunctionNodeFromIIFE(callExpression), undefined);
        });
    });

    describe('trimUnderscores', function() {
        it('should trim trailing underscores', function() {
            assert.equal(utils.trimUnderscores('__snake_cased'), 'snake_cased');
            assert.equal(utils.trimUnderscores('snake_cased__'), 'snake_cased');
            assert.equal(utils.trimUnderscores('__snake_cased__'), 'snake_cased');
            assert.equal(utils.trimUnderscores('__camelCased'), 'camelCased');
            assert.equal(utils.trimUnderscores('camelCased__'), 'camelCased');
            assert.equal(utils.trimUnderscores('__camelCased__'), 'camelCased');
        });

        it('should not trim underscores for underscores only', function() {
            assert.equal(utils.trimUnderscores('_'), '_');
            assert.equal(utils.trimUnderscores('__'), '__');
        });
    });

    describe('isRelativePath', function() {
        it('returns true if the path is relative', function() {
            assert.ok(utils.isRelativePath('../'));
            assert.ok(utils.isRelativePath('./'));
        });

        it('returns false if the path is not relative', function() {
            assert.ok(!utils.isRelativePath('path/to'));
        });
    });

    describe('normalizePath', function() {
        var base = __dirname + '/bar/baz';

        it('returns the original path if it is not relative', function() {
            assert.ok(utils.normalizePath('foo', base) === 'foo');
        });

        it('returns the relative path resolved against the base path', function() {
            assert.ok(utils.normalizePath('../foo', base) === (path.dirname(base) + '/foo'));
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
            assert.ok(typeof wrapped(1).then === 'function');
        });

        it('resolves the promise when the node-style callback has no error', function(done) {
            var wrapped = utils.promisify(resolveFn);

            wrapped(1).then(function(data) {
                assert.ok(data === 1);
                done();
            });
        });

        it('rejects the promise when the node-style callback has an error', function(done) {
            var wrapped = utils.promisify(rejectFn);
            wrapped(1).then(null, function(err) {
                assert.ok(err);
                done();
            });
        });
    });
});
