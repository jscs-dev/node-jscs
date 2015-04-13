var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/disallow-padding-newlines-before-export', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ disallowPaddingNewLinesBeforeExport: true });
        });

        it('should not report no padding before export', function() {
            assert(checker.checkString('var a = 2;\nmodule.exports = a;').isEmpty());
        });

        it('should not report missing padding if first line', function() {
            assert(checker.checkString('module.exports = 2;').isEmpty());
        });

        it('should report padding before export', function() {
            assert(checker.checkString('var a = 2;\n\nmodule.exports = a;').getErrorCount() === 1);
        });

        it('should not report comment before export', function() {
            assert(checker.checkString('var a = 2;\n// foo\nmodule.exports = a;').isEmpty());
        });

        it('should not report comment with extra padding before export', function() {
            assert(checker.checkString('var a = 2;\n\n// foo\nmodule.exports = a;').isEmpty());
        });

        it('should not report padding before object assignment', function() {
            assert(checker.checkString('var a = 2;\n\nfoo.exports = a;').isEmpty());
            assert(checker.checkString('var a = 2;\n\nmodule.foo = a;').isEmpty());
        });
    });
});
