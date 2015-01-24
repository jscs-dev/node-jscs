var Checker = require('../../lib/checker');
var assert = require('assert');

describe('rules/disallow-dangling-underscores', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value true', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: true });
        });

        it('should report leading underscores', function() {
            assert(checker.checkString('var _x = "x";').getErrorCount() === 1);
        });

        it('should report trailing underscores', function() {
            assert(checker.checkString('var x_ = "x";').getErrorCount() === 1);
        });

        it('should report trailing underscores in member expressions', function() {
            assert(checker.checkString('var x = this._privateField;').getErrorCount() === 1);
            assert(checker.checkString('var x = instance._protectedField;').getErrorCount() === 1);
        });

        it('should report trailing underscores', function() {
            assert(checker.checkString('var x_ = "x";').getErrorCount() === 1);
        });

        it('should not report inner underscores', function() {
            assert(checker.checkString('var x_y = "x";').isEmpty());
        });

        it('should not report no underscores', function() {
            assert(checker.checkString('var xy = "x";').isEmpty());
        });
    });

    describe('option value true: default exceptions', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: true });
        });

        it('should not report the prototype property', function() {
            assert(checker.checkString('var proto = obj.__proto__;').isEmpty());
        });

        it('should not report underscore.js', function() {
            assert(checker.checkString('var extend = _.extend;').isEmpty());
        });

        it('should not report node globals', function() {
            assert(checker.checkString('var a = __dirname + __filename;').isEmpty());
        });

        it('should not report the super constructor reference created by node\'s util.inherits', function() {
            assert(checker.checkString('Inheritor.super_.call(this);').isEmpty());
        });
    });

    describe('exceptions', function() {
        beforeEach(function() {
            checker.configure({ disallowDanglingUnderscores: { allExcept: ['_test', 'test_', '_test_', '__test'] } });
        });

        it('should not report default exceptions: underscore.js', function() {
            assert(checker.checkString('var extend = _.extend;').isEmpty());
        });

        it('should not report _test', function() {
            assert(checker.checkString('var a = _test;').isEmpty());
        });

        it('should not report test_', function() {
            assert(checker.checkString('var a = test_;').isEmpty());
        });

        it('should not report _test_', function() {
            assert(checker.checkString('var a = _test_;').isEmpty());
        });

        it('should not report test__', function() {
            assert(checker.checkString('var a = __test;').isEmpty());
        });

        it('should report dangling underscore identifier that is not included in the array', function() {
            assert(checker.checkString('var a = _notIncluded;').getErrorCount() === 1);
        });
    });
});
