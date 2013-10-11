var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/safe-context-keyword', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ safeContextKeyword: 'that' });
    });

    describe('var', function() {
        it('should not report "var that = this"', function() {
            assert(checker.checkString('var that = this;').isEmpty());
        });

        it('should report "var notthat = this"', function() {
            assert(checker.checkString('var notthat = this;').getErrorCount() === 1);
        });
    });

    describe('withot var', function() {
        it('should not report "var that = this"', function() {
            assert(checker.checkString('that = this;').isEmpty());
        });

        it('should report "var notthat = this"', function() {
            assert(checker.checkString('notthat = this;').getErrorCount() === 1);
        });
    });

    describe('multiple var decl', function() {
        it('should not report "var that = this"', function() {
            assert(checker.checkString('var a = 1, that = this;').isEmpty());
        });

        it('should report "var notthat = this"', function() {
            assert(checker.checkString('var a = 1, notthat = this;').getErrorCount() === 1);
        });
    });

});
