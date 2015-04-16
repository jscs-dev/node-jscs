var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-camelcase-or-uppercase-identifiers', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('option value `true`', function() {
        beforeEach(function() {
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

        it('should report object keys', function() {
            assert(checker.checkString('var extend = { snake_case: a };').getErrorCount() === 1);
        });

        it('should report object properties', function() {
            assert(checker.checkString('var extend = a.snake_case;').getErrorCount() === 1);
        });

        it('should report identifiers that are the last token', function() {
            assert(checker.checkString('var a = snake_case').getErrorCount() === 1);
        });

        it('should report identifiers that are the first token', function() {
            assert(checker.checkString('snake_case = a;').getErrorCount() === 1);
        });
    });

    describe('option value `"ignoreProperties"`', function() {
        beforeEach(function() {
            checker.configure({ requireCamelCaseOrUpperCaseIdentifiers: 'ignoreProperties' });
        });

        it('should not report object keys', function() {
            assert(checker.checkString('var extend = { snake_case: a };').isEmpty());
        });

        it('should not report object properties', function() {
            assert(checker.checkString('var extend = a.snake_case;').isEmpty());
        });

        it('should report identifiers that are the last token', function() {
            assert(checker.checkString('var a = snake_case').getErrorCount() === 1);
        });

        it('should report identifiers that are the first token', function() {
            assert(checker.checkString('snake_case = a;').getErrorCount() === 1);
        });

        it('should not report es5 getters', function() {
            assert(checker.checkString('var extend = { get a_b() { } };').isEmpty());
        });

        it('should not report es5 setters', function() {
            assert(checker.checkString('var extend = { set c_d(v) { } };').isEmpty());
        });
    });
});
