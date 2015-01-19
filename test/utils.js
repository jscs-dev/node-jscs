var utils = require('../lib/utils');
var assert = require('assert');

describe('modules/utils', function() {
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
});
