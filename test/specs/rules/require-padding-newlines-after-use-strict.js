var Checker = require('../../../lib/checker');
var assert = require('assert');
var reportAndFix = require('../../lib/assertHelpers').reportAndFix;

describe('rules/require-padding-newlines-after-use-strict', function() {
    var rules = { requirePaddingNewLinesAfterUseStrict: true };
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(rules);
    });

    it('should not report if use strict is not present', function() {
        assert(checker.checkString('var a = 2;').isEmpty());
    });

    reportAndFix({
        name: 'with no blank line',
        rules: rules,
        input: '"use strict";\nvar a = 2;',
        output: '"use strict";\n\nvar a = 2;'
    });

    it('should report when followed by comment without blank line', function() {
        assert(checker.checkString('"use strict";\n// comment\nvar a = 2;').getErrorCount() === 1);
    });

    it('should not report when followed by comment with blank line', function() {
        assert(checker.checkString('"use strict";\n\n// comment\nvar a = 2;').isEmpty());
    });

    it('should not report with blank line', function() {
        assert(checker.checkString('"use strict";\n\nvar a = 2;').isEmpty());
    });

    it('should not report with extra blank lines', function() {
        assert(checker.checkString('"use strict";\n\n\nvar a = 2;').isEmpty());
    });

    it('should not report other statements', function() {
        assert(checker.checkString('"use stricts";\nvar a = 2;').isEmpty());
        assert(checker.checkString('2 + 2;\nvar a = 2;').isEmpty());
    });

    describe('allExcept: ["require"]', function() {
        beforeEach(function() {
            checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({requirePaddingNewLinesAfterUseStrict: {allExcept: ['require']}});
        });
        it('should not report require statements occurring after \'use strict\'', function() {
            assert(
                checker.checkString(
                  '"use strict"\nvar a = require("b");'
                ).isEmpty()
            );
            assert(
                checker.checkString(
                  '"use strict"\nvar a = 3;'
                ).getErrorCount() === 1
            );
            assert(
                checker.checkString(
                  '"use strict"\nvar a = 3;var x = require("y")'
                ).getErrorCount() === 1
            );
        });
    });
});
