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

        it('should report function name mismatch when assigning to member', function() {
            assertErrorForMemberNameMismatch('var test = {}; test.foo = function bar() {};');
        });

        it('should report function name mismatch when assigning to member via ["..."]', function() {
            assertErrorForMemberNameMismatch('var test = {}; test["foo"] = function bar() {};');
        });

        it('should NOT report function name mismatch when assigning anonymous to member', function() {
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

        it('should NOT report function name mismatch when property name is reserved word', function() {
            assertNoErrors('var test = {delete: function $delete() {}};');
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
