var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/require-trailing-comma', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function () {
        beforeEach(function () {
            checker.configure({ requireTrailingComma: true });
        });

        it('should allow object or array initialization without comma', function() {
            assert(checker.checkString('var x = {}').getErrorCount() === 0);
            assert(checker.checkString('var x = { }').getErrorCount() === 0);
            assert(checker.checkString('var x = []').getErrorCount() === 0);
            assert(checker.checkString('var x = [ ]').getErrorCount() === 0);
        });

        it('should report trailing comma required in object literal', function() {
            assert(checker.checkString('var x = {a: "a", b: "b",}').getErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a", b: "b",\n}').getErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a", b: "b"}').getErrorCount() === 1);
            assert(checker.checkString('var x = {a: "a", b: "b"\n}').getErrorCount() === 1);
            assert(checker.checkString('function foo() {\nreturn {a: "a"};\n}').getErrorCount() === 1);
        });

        it('should report trailing comma required in array', function() {
            assert(checker.checkString('var x = [1, 2,]').getErrorCount() === 0);
            assert(checker.checkString('var x = [1, 2,\n]').getErrorCount() === 0);
            assert(checker.checkString('var x = [1, 2]').getErrorCount() === 1);
            assert(checker.checkString('var x = [1, 2\n]').getErrorCount() === 1);
            assert(checker.checkString('function foo() {\nreturn [1, 2];\n}').getErrorCount() === 1);
        });

        it('should not report block scopes (#368)', function() {
            assert(checker.checkString('if(true) {\nconsole.log(\'Hello World\');\n}').getErrorCount() === 0);
            assert(checker.checkString('function add(a, b) {\nreturn a + b;\n}').getErrorCount() === 0);
        });

        it('should not report array access (#368)', function () {
            assert(checker.checkString('var foo = [\'Hello World\',\n];\nvar bar = foo[0];').getErrorCount() === 0);
        });
    });

    describe('ignoreSingleValue', function () {
        beforeEach(function () {
            checker.configure({
                requireTrailingComma: {
                    ignoreSingleValue: true
                }
            });
        });

        it('should allow object or array with single property', function () {
            assert(checker.checkString('var x = [1]').getErrorCount() === 0);
            assert(checker.checkString('var x = {a: "a"}').getErrorCount() === 0);
        });

        it('should report trailing comma required for two or more elements in an array', function () {
            assert(checker.checkString('var x = [1, 2]').getErrorCount() === 1);
            assert(checker.checkString('var x = [1, 2, 3]').getErrorCount() === 1);
        });

        it('should report trailing comma required for two or more properties in an object', function () {
            assert(checker.checkString('var x = {a: "a", b: "b"}').getErrorCount() === 1);
            assert(checker.checkString('var x = {a: "a", b: "b", c: "c"}').getErrorCount() === 1);
        });

        it('should not report empty array or object', function () {
            assert(checker.checkString('var x = []').getErrorCount() === 0);
            assert(checker.checkString('var x = {}').getErrorCount() === 0);
        });
    });
});
