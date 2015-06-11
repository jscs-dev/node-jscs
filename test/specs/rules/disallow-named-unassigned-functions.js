var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-named-unassigned-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                disallowNamedUnassignedFunctions: true
            });
        });

        it('should not report on unnamed unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function(){});').isEmpty());
        });

        it('should report on named unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function named(){});').getErrorCount() === 1);
        });

        it('should not report on named function declarations', function() {
            assert(checker.checkString('function named(){};').isEmpty());
        });

        it('should not report on assigned function expressions', function() {
            assert(checker.checkString('var x = function(){};').isEmpty());
            assert(checker.checkString('var foo = {bar: function() {}};').isEmpty());
            assert(checker.checkString('foo.bar = function() {};').isEmpty());
            assert(checker.checkString('var x = function named(){};').isEmpty());
            assert(checker.checkString('var foo = {bar: function named() {}};').isEmpty());
            assert(checker.checkString('foo.bar = function named() {};').isEmpty());
        });
    });
});
