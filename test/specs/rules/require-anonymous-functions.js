var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-anonymous-function', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireAnonymousFunctions: true
        });
    });

    it('should not report on anonymous function declarations', function() {
        assert(checker.checkString('$("hi").click(function(){});').isEmpty());
    });

    it('should not report on anonymous function expressions', function() {
        assert(checker.checkString('var x = function(){};').isEmpty());
        assert(checker.checkString('var foo = {bar: function() {}};').isEmpty());
    });

    it('should report on named function declarations', function() {
        assert(checker.checkString('function named(){}').getErrorCount() === 1);
    });

    it('should report on named function expressions', function() {
        assert(checker.checkString('$("hi").click(function named(){});').getErrorCount() === 1);
        assert(checker.checkString('var x = function named(){};').getErrorCount() === 1);
    });

    describe('allExcept: ["declarations"]', function() {
        beforeEach(function() {
            checker.configure({ requireAnonymousFunctions: { allExcept: ['declarations'] } });
        });

        it('should not report on named function declarations', function() {
            assert(checker.checkString('function foo(){}').isEmpty());
        });

        it('should report on named function expressions', function() {
            assert(checker.checkString('var foo = function bar(){};').getErrorCount() === 1);
        });
    });
});
