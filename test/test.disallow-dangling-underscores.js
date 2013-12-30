var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/disallow-dangling-underscores', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
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

    it('should not report underscore.js', function() {
        assert(checker.checkString('var extend = _.extend;').isEmpty());
    });

    it('should not report node globals', function() {
        assert(checker.checkString('var a = __dirname + __filename;').isEmpty());
    });

    it('should not report inner underscores', function() {
        assert(checker.checkString('var x_y = "x";').isEmpty());
    });

    it('should not report no underscores', function() {
        assert(checker.checkString('var xy = "x";').isEmpty());
    });
});
