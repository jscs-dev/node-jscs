var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/maximum-number-of-lines', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('number option', function() {
        beforeEach(function() {
            checker.configure({ maximumNumberOfLines: 2 });
        });

        it('should report a number of lines longer than the maximum', function() {
            assert(checker.checkString('var xyz;\nvar xyz;\nvar xyz;').getErrorCount() === 1);
        });

        it('should not report a number of lines equal to the maximum', function() {
            assert(checker.checkString('var xy;\nvar xy;').isEmpty());
        });

        it('should not report a number of lines shorter than the maximum', function() {
            assert(checker.checkString('var x;').isEmpty());
        });
    });
});
