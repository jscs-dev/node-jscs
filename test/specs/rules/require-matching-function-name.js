var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-matching-function-name', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ requireMatchingFunctionName: true });
        });

        // TODO:
        //   - assigning function to variable (both names should match)
        //   - assigning function declaration to member
        //   - assigning function declaration to property
        // For both cases we should track identifier back, check whether
        // it's a function and if so, compare the names

        it('should NOT throw when assigning anonymous function to a var', function() {
            assertNoErrors('var myFunction; myFunction = function(name) {};');
        });

        it('should NOT throw when assigning named function to a var', function() {
            assertErrorForMemberNameMismatch('var myFunction; myFunction = function anotherFunction(name) {};');
        });

        it('should report function name mismatch when assigning to member', function() {
            assertErrorForMemberNameMismatch('var test = {}; test.foo = function bar() {};');
        });

        it('should not report function name mismatch in object', function() {
            assert(checker.checkString('var object = {foo: function foo() {}}').isEmpty());
        });

        it('should report function name mismatch when assigning to member deeply', function() {
            assertErrorForMemberNameMismatch('var test = {baz:{}}; test.baz.foo = function bar() {};');
        });

        it('should NOT report function with name match when assigning to member deeply', function() {
            assertNoErrors('var test = {baz:{}}; test.baz.foo = function foo() {};');
        });

        it('should report function name mismatch when assigning to member via ["..."]', function() {
            assertErrorForMemberNameMismatch('var test = {}; test["foo"] = function bar() {};');
        });

        it('should NOT report function with name match when assigning to member via ["..."]', function() {
            assertNoErrors('var test = {}; test["foo"] = function foo() {};');
        });

        it('should NOT report function name match when assigning anonymous to member', function() {
            assertNoErrors('var test = {}; test.foo = function() {};');
        });

        it('should NOT report function name mismatch when member name is reserved word', function() {
            assertNoErrors('var test = {}; test.delete = function $delete() {};');
        });

        it('should report function name mismatch when assigning to property', function() {
            assertErrorForPropertyNameMismatch('var test = {foo: function bar() {}};');
        });

        it('should NOT report function name mismatch when assigning anonymous to property', function() {
            assertNoErrors('var test = {foo: function() {}};');
        });

        it('should NOT report function name mismatch when assigning anonymous to property', function() {
            assertNoErrors('var test = {foo: function() {}};');
        });

        it('should NOT report function name mismatch when property name is reserved word', function() {
            assertNoErrors('var test = {delete: function $delete() {}};');
        });

        it('should NOT report function name mismatch when property name is dynamic', function() {
            assertNoErrors('var test = {["x" + 2]: function bar(){}};');
        });

        it('should NOT report function assignation to an expression', function() {
            assertNoErrors('var test = {}; test["x" + 2] = function bar(){};');
        });

        it('should NOT report function name match on ES6 destructuring', function() {
            assertNoErrors('let [ bar ] = [ function bar(){} ];');
        });

        function assertErrorForMemberNameMismatch(js) {
            assertError(js, 'Function name does not match member name');
        }

        function assertErrorForPropertyNameMismatch(js) {
            assertError(js, 'Function name does not match property name');
        }

        function assertError(js, message) {
            var errors = checker.checkString(js).getErrorList();
            assert(errors.length);
            assert.equal(errors[0].rule, 'requireMatchingFunctionName');
            assert.equal(errors[0].message, message);
        }

        function assertNoErrors(js) {
            var errors = checker.checkString(js).getErrorList();
            assert.equal(errors.length, 0);
        }
    });
});
