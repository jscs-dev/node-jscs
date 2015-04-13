var Checker = require('../../../lib/checker');
var assert = require('assert');

describe('rules/require-padding-newlines-before-export', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    describe('value true', function() {
        beforeEach(function() {
            checker.configure({ requirePaddingNewLinesBeforeExport: true });
        });

        it('should report missing padding before export', function() {
            assert(checker.checkString('var a = 2;\nmodule.exports = a;').getErrorCount() === 1);
        });

        it('should not report missing padding if first line', function() {
            assert(checker.checkString('module.exports = 2;').isEmpty());
        });

        it('should not report padding before export', function() {
            assert(checker.checkString('var a = 2;\n\nmodule.exports = a;').isEmpty());
        });

        it('should not report lack of padding before object assignment', function() {
            assert(checker.checkString('var a = 2;\nfoo.exports = a;').isEmpty());
            assert(checker.checkString('var a = 2;\nmodule.foo = a;').isEmpty());
        });
    });
});
