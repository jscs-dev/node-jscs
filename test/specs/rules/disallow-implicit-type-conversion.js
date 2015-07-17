var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-implicit-type-conversion', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option ["numeric"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['numeric'] });
        });

        it('should report implicit numeric conversion', function() {
            assert(checker.checkString('var x = +y;').getErrorCount() === 1);
        });

        it('should not report negative numbers', function() {
            assert(checker.checkString('var x = -y;').isEmpty());
        });
    });

    describe('option ["binary"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['binary'] });
        });

        it('should report implicit binary conversion', function() {
            assert(checker.checkString('var x = ~y;').getErrorCount() === 1);
        });
    });

    describe('option ["boolean"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['boolean'] });
        });

        it('should report implicit boolean conversion', function() {
            assert(checker.checkString('var x = !!y;').getErrorCount() === 1);
        });
    });

    describe('option ["string"]', function() {
        beforeEach(function() {
            checker.configure({ disallowImplicitTypeConversion: ['string'] });
        });

        it('should report implicit string conversion on rhs', function() {
            assert(checker.checkString('var x = y + \'\';').getErrorCount() === 1);
        });

        it('should report implicit string conversion on lhs', function() {
            assert(checker.checkString('var x = \'\' + y;').getErrorCount() === 1);
        });

        it('should not report string literal', function() {
            assert(checker.checkString('var x = \'hi\' + y;').isEmpty());
        });

        it('should not report operations other than +', function() {
            assert(checker.checkString('var x = \'\' * y;').isEmpty());
        });

        it('should not report concatination with two literals (#1538)', function() {
            assert(checker.checkString('"" + "string";').isEmpty());
        });
    });
});
