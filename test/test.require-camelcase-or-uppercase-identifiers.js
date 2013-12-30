var Checker = require('../lib/checker');
var assert = require('assert');

describe('rules/require-camelcase-or-uppercase-identifiers', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: true });
    });

    it('should report inner all-lowercase underscores', function() {
        assert(checker.checkString('var x_y = "x";').getErrorCount() === 1);
    });

    it('should report inner some-lowercase underscores', function() {
        assert(checker.checkString('var X_y = "x";').getErrorCount() === 1);
    });

    it('should not report inner all-uppercase underscores', function() {
        assert(checker.checkString('var X_Y = "x";').isEmpty());
    });

    it('should not report no underscores', function() {
        assert(checker.checkString('var xy = "x";').isEmpty());
    });

    it('should not report leading underscores', function() {
        assert(checker.checkString('var _x = "x", __y = "y";').isEmpty());
    });

    it('should report trailing underscores', function() {
        assert(checker.checkString('var x_ = "x", y__ = "y";').isEmpty());
    });

    it('should not report underscore.js', function() {
        assert(checker.checkString('var extend = _.extend;').isEmpty());
    });

    it('should not report node globals', function() {
        assert(checker.checkString('var a = __dirname + __filename;').isEmpty());
    });
});
