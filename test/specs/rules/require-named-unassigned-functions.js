var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-named-unassigned-functions', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                requireNamedUnassignedFunctions: true
            });
        });

        it('should report on unnamed unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function(){});').getErrorCount() === 1);
        });

        it('should not report on named unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function named(){});').isEmpty());
        });

        it('should not report on function declarations', function() {
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

    describe('option value allExcept', function() {
        beforeEach(function() {
            checker.configure({
                requireNamedUnassignedFunctions: {
                    allExcept: ['it', 'it.skip', 'x.y.z', 'x[1]', 'x[0].z']
                }
            });
        });

        it('should report on unnamed unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function(){});').getErrorCount() === 1);
        });

        it('should not report on named unassigned function expressions', function() {
            assert(checker.checkString('$("hi").click(function named(){});').isEmpty());
        });

        it('should not report on function declarations', function() {
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

        it('should not report on excepted unnamed unassigned function expressions', function() {
            assert(checker.checkString('it(function (){});').isEmpty());
            assert(checker.checkString('it.skip(function () {});').isEmpty());
            assert(checker.checkString('x.y.z(function () {});').isEmpty());
            assert(checker.checkString('x[1](function () {});').isEmpty());
            assert(checker.checkString('x[0].z(function () {});').isEmpty());
        });

        it('should not report on excepted unnamed unassigned using bracket notation', function() {
            assert(checker.checkString('it[\'skip\'](function () {});').isEmpty());
        });

        it('doesn\'t explode on literals/constructors', function() {
            assert(checker.checkString('[0].forEach(function () {});').getErrorCount() === 1);
            assert(checker.checkString('(new Item()).forEach(function () {});').getErrorCount() === 1);
        });
    });

    describe('option value allExcept bad array', function() {
        it('raises an assertion error', function() {
            try {
                checker.configure({
                    requireNamedUnassignedFunctions: {
                        allExcept: 'unexpected content'
                    }
                });
            } catch (err) {
                return;
            }
            assert.fail('`checker.configure` should have raised an error for an invalid type');
        });
    });
});
