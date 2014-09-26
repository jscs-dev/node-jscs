var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-function-declarations', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            requireFunctionDeclarations: true
        });
    });

    it('should report on anonymous function expression declarations', function() {
        assert(checker.checkString('var anon = function() {};').getErrorCount() === 1);
    });

    it('should report on named function expression declarations', function() {
        assert(checker.checkString('var named = function named() {};').getErrorCount() === 1);
    });

    it('should report on anonymous function expression assignments', function() {
        assert(checker.checkString('var anon; anon = function() {};').getErrorCount() === 1);
    });

    it('should report on named function expression assignments', function() {
        assert(checker.checkString('var named; named = function named() {};').getErrorCount() === 1);
    });

    it('should ignore member expression assignments', function() {
        assert(checker.checkString('obj.a = function() {};').isEmpty());
    });

    it('should ignore IIFEs', function() {
        assert(checker.checkString('(function() { void 0; })();').isEmpty());
    });

    it('should ignore function expressions in object literals', function() {
        assert(checker.checkString('var foo = {bar: function() {}};').isEmpty());
    });

    it('should ignore function expressions in function calls', function() {
        assert(checker.checkString('onclick(function() {})').isEmpty());
    });
});
