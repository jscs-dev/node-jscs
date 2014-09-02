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
});
