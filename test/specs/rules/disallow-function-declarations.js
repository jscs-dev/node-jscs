var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-function-declarations', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();

        checker.configure({
            disallowFunctionDeclarations: true
        });
    });

    it('should report on function declarations', function() {
        assert(checker.checkString('function declared() { }').getErrorCount() === 1);
    });

    it('should not report on anonymous function expressions', function() {
        assert(checker.checkString('var expressed = function (){};').isEmpty());
        assert(checker.checkString('var foo = {bar: function() {}};').isEmpty());
    });

    it('should not report on named function expressions', function() {
        assert(checker.checkString('$("hi").click(function named(){});').isEmpty());
        assert(checker.checkString('var x = function named(){};').isEmpty());
    });
});
