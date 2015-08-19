var utils = require('../../lib/utils');
var assert = require('assert');
var JsFile = require('../../lib/js-file');
var esprima = require('esprima');
var babelJscs = require('babel-jscs');
var path = require('path');

describe('utils', function() {

    function createJsFile(source, customEsprima) {
        return new JsFile({
            filename: 'example.js',
            source: source,
            esprima: customEsprima || esprima,
            esprimaOptions: {loc: true, range: true, comment: true, tokens: true}
        });
    }

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
            assert.equal(utils.normalizePath('../foo', base), path.resolve(path.dirname(base), 'foo'));
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

    describe('getBabelType', function() {
        it('returns private property `_babelType`', function() {
            var file = createJsFile('var a = { ...a };', babelJscs);
            var property = file.getNodesByType('ObjectExpression')[0].properties[0];
            assert.equal(utils.getBabelType(property), 'SpreadProperty');
        });
    });
});
