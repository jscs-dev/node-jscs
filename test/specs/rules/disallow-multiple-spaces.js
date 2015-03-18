var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-multiple-spaces', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({
                disallowMultipleSpaces: true
            });
        });

        it('should report multiple spaces', function() {
            assert(checker.checkString('var x  = "oops";').getErrorCount() === 1);
            assert(checker.checkString('function x  () {}').getErrorCount() === 1);
            assert(checker.checkString('function x()  {}').getErrorCount() === 1);
            assert(checker.checkString('1  + 2').getErrorCount() === 1);
            assert(checker.checkString('1 +  2').getErrorCount() === 1);
        });

        it('should report multiple spaces between comments', function() {
            assert(checker.checkString('var X = {  /** @type {String} */ name: "some" };').getErrorCount() === 1);
            assert(checker.checkString('var x = "oops";  // Multiple spaces before comment').getErrorCount() === 1);
        });

        it('should not report single spaces between comments', function() {
            assert(checker.checkString('var X = { /** @type {String} */ name: "some" };').isEmpty());
            assert(checker.checkString('var x = "oops"; // Multiple spaces before comment').isEmpty());
        });

        it('should not report single spaces', function() {
            assert(checker.checkString('var x = "oops";').isEmpty());
            assert(checker.checkString('function x() {}').isEmpty());
            assert(checker.checkString('function x () {}').isEmpty());
            assert(checker.checkString('1 + 2').isEmpty());
        });

        it('should not report no spaces', function() {
            assert(checker.checkString('var x="oops";').isEmpty());
            assert(checker.checkString('function x(){}').isEmpty());
            assert(checker.checkString('1+2').isEmpty());
        });

        it('should not report multiple spaces in strings/regular expressions', function() {
            assert(checker.checkString('"hello  world";').isEmpty());
            assert(checker.checkString('/hello  world/').isEmpty());
        });

        it('should not report multiple lines', function() {
            assert(checker.checkString('var x = "oops";\nvar y = "hello";').isEmpty());
        });

        it('should not report indentation', function() {
            assert(checker.checkString('    var x = "oops";').isEmpty());
        });
    });

    describe('option value allowEOLComments', function() {
        beforeEach(function() {
            checker.configure({
                disallowMultipleSpaces: {
                    allowEOLComments: true
                }
            });
        });

        it('should report multiple spaces', function() {
            assert(checker.checkString('var x  = "oops";').getErrorCount() === 1);
        });

        it('should report multiple spaces between inline comments', function() {
            assert(checker.checkString('var X = {  /** @type {String} */ name: "some" };').getErrorCount() === 1);
        });

        it('should not report multiple spaces between EOL comments', function() {
            assert(checker.checkString('var x = "oops";  // Multiple spaces before comment').isEmpty());
        });

        it('should not report single spaces between comments', function() {
            assert(checker.checkString('var X = { /** @type {String} */ name: "some" };').isEmpty());
            assert(checker.checkString('var x = "oops"; // Multiple spaces before comment').isEmpty());
        });

        it('should not report single spaces', function() {
            assert(checker.checkString('var x = "oops";').isEmpty());
        });

        it('should not report no spaces', function() {
            assert(checker.checkString('1+2').isEmpty());
        });
    });

    describe('option value bad value', function() {
        it('raises an assertion error', function() {
            try {
                checker.configure({
                    disallowMultipleSpaces: 'apple'
                });
            } catch (err) {
                return;
            }
            assert.fail('`checker.configure` should have raised an error for an invalid value');
        });
    });
});
