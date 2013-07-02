var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-implicit-type-conversion', function() {
    var checker;
    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });
    it('should report implicit numeric conversion', function() {
        checker.configure({ disallowImplicitTypeConversion: ['numeric'] });
        assert(checker.checkString('var x = +y;').getErrorCount() === 1);
    });
    it('should report implicit binary conversion', function() {
        checker.configure({ disallowImplicitTypeConversion: ['binary'] });
        assert(checker.checkString('var x = ~y;').getErrorCount() === 1);
    });
    it('should report implicit boolean conversion', function() {
        checker.configure({ disallowImplicitTypeConversion: ['boolean'] });
        assert(checker.checkString('var x = !!y;').getErrorCount() === 1);
    });
    it('should report implicit string conversion', function() {
        checker.configure({ disallowImplicitTypeConversion: ['string'] });
        assert(checker.checkString('var x = y + \'\';').getErrorCount() === 1);
    });
    it('should not report implicit numeric conversion', function() {
        checker.configure({ disallowImplicitTypeConversion: ['numeric'] });
        assert(checker.checkString('var x = -y;').isEmpty());
    });
});
